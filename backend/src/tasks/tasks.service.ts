import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  ToggleSubtaskDto,
  MoveTaskDto,
} from './tasks.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async assertColumnOwned(columnId: string, guestUserId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    if (column.board.guestUserId !== guestUserId) {
      throw new ForbiddenException('You do not have access to this column');
    }

    return column;
  }

  private async assertTaskOwned(taskId: string, guestUserId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        subtasks: true,
        column: { include: { board: true } },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.column.board.guestUserId !== guestUserId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  private async reindexColumn(tx: TxClient, columnId: string, orderedIds: string[]) {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.task.update({
        where: { id: orderedIds[i] },
        data: { position: i, columnId },
      });
    }
  }

  async create(createTaskDto: CreateTaskDto, guestUserId: string) {
    const { title, description, status, columnId, subtasks } = createTaskDto;
    await this.assertColumnOwned(columnId, guestUserId);

    const taskCount = await this.prisma.task.count({ where: { columnId } });

    return this.prisma.task.create({
      data: {
        title,
        description,
        status,
        columnId,
        position: taskCount,
        subtasks: subtasks
          ? {
              create: subtasks.map((sub) => ({
                title: sub.title,
                isCompleted: false,
              })),
            }
          : undefined,
      },
      include: { subtasks: true },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, guestUserId: string) {
    const task = await this.assertTaskOwned(id, guestUserId);
    const { title, description, status, columnId, position, subtasks } = updateTaskDto;

    const shouldMove = columnId !== undefined || position !== undefined;

    if (shouldMove) {
      const targetColumnId = columnId ?? task.columnId;
      await this.assertColumnOwned(targetColumnId, guestUserId);

      const targetTasks = await this.prisma.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: 'asc' },
      });

      const defaultPosition =
        targetColumnId === task.columnId
          ? task.position
          : targetTasks.filter((t) => t.id !== id).length;

      await this.move(
        id,
        {
          columnId: targetColumnId,
          status: status ?? task.status,
          position: position ?? defaultPosition,
        },
        guestUserId,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.TaskUpdateInput = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (status !== undefined && !shouldMove) data.status = status;

      if (Object.keys(data).length > 0) {
        await tx.task.update({ where: { id }, data });
      }

      if (subtasks) {
        const existingSubtasks = task.subtasks;
        const incomingIds = subtasks
          .filter((sub) => sub.id)
          .map((sub) => sub.id as string);

        for (const sub of existingSubtasks.filter((s) => !incomingIds.includes(s.id))) {
          await tx.subtask.delete({ where: { id: sub.id } });
        }

        for (const sub of subtasks) {
          if (sub.id) {
            const ownsSub = existingSubtasks.some((s) => s.id === sub.id);
            if (!ownsSub) {
              throw new ForbiddenException('Invalid subtask reference for this task');
            }
            await tx.subtask.update({
              where: { id: sub.id },
              data: { title: sub.title, isCompleted: sub.isCompleted },
            });
          } else {
            await tx.subtask.create({
              data: {
                title: sub.title,
                isCompleted: sub.isCompleted ?? false,
                taskId: id,
              },
            });
          }
        }
      }

      return tx.task.findUnique({
        where: { id },
        include: { subtasks: true },
      });
    });
  }

  async move(id: string, moveDto: MoveTaskDto, guestUserId: string) {
    const task = await this.assertTaskOwned(id, guestUserId);
    const targetColumn = await this.assertColumnOwned(moveDto.columnId, guestUserId);

    if (targetColumn.boardId !== task.column.boardId) {
      throw new ForbiddenException('Cannot move task to a column on another board');
    }

    return this.prisma.$transaction(async (tx) => {
      const sourceColumnId = task.columnId;
      const targetColumnId = moveDto.columnId;

      const sourceTasks = await tx.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { position: 'asc' },
      });

      const targetTasks =
        sourceColumnId === targetColumnId
          ? sourceTasks
          : await tx.task.findMany({
              where: { columnId: targetColumnId },
              orderBy: { position: 'asc' },
            });

      const sourceIds = sourceTasks.map((t) => t.id).filter((tid) => tid !== id);
      const targetIds =
        sourceColumnId === targetColumnId
          ? [...sourceIds]
          : targetTasks.map((t) => t.id).filter((tid) => tid !== id);

      const insertAt = Math.min(Math.max(moveDto.position, 0), targetIds.length);
      targetIds.splice(insertAt, 0, id);

      if (sourceColumnId === targetColumnId) {
        await this.reindexColumn(tx, targetColumnId, targetIds);
      } else {
        await this.reindexColumn(tx, sourceColumnId, sourceIds);
        await this.reindexColumn(tx, targetColumnId, targetIds);
      }

      return tx.task.update({
        where: { id },
        data: {
          columnId: targetColumnId,
          status: moveDto.status,
          position: insertAt,
        },
        include: { subtasks: true },
      });
    });
  }

  async remove(id: string, guestUserId: string) {
    const task = await this.assertTaskOwned(id, guestUserId);

    return this.prisma.$transaction(async (tx) => {
      const siblings = await tx.task.findMany({
        where: { columnId: task.columnId, NOT: { id } },
        orderBy: { position: 'asc' },
      });

      await tx.task.delete({ where: { id } });
      await this.reindexColumn(
        tx,
        task.columnId,
        siblings.map((s) => s.id),
      );

      return { id };
    });
  }

  async toggleSubtask(
    id: string,
    toggleSubtaskDto: ToggleSubtaskDto,
    guestUserId: string,
  ) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            column: { include: { board: true } },
          },
        },
      },
    });

    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }

    if (subtask.task.column.board.guestUserId !== guestUserId) {
      throw new ForbiddenException('You do not have access to this subtask');
    }

    return this.prisma.subtask.update({
      where: { id },
      data: { isCompleted: toggleSubtaskDto.isCompleted },
    });
  }
}
