import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto, UpdateTaskDto, ToggleSubtaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { subtasks: true },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, status, columnId, subtasks } = createTaskDto;

    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

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

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    const { title, description, status, columnId, position, subtasks } = updateTaskDto;

    if (columnId && columnId !== task.columnId) {
      const column = await this.prisma.column.findUnique({ where: { id: columnId } });
      if (!column) {
        throw new NotFoundException(`Column with ID ${columnId} not found`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id },
        data: {
          title,
          description,
          status,
          columnId,
          position: position !== undefined ? position : undefined,
        },
      });

      if (subtasks) {
        const existingSubtasks = task.subtasks;
        const incomingIds = subtasks.filter((sub) => sub.id).map((sub) => sub.id as string);

        const subtasksToDelete = existingSubtasks.filter((sub) => !incomingIds.includes(sub.id));
        for (const sub of subtasksToDelete) {
          await tx.subtask.delete({
            where: { id: sub.id },
          });
        }

        for (const sub of subtasks) {
          if (sub.id) {
            await tx.subtask.update({
              where: { id: sub.id },
              data: {
                title: sub.title,
                isCompleted: sub.isCompleted,
              },
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

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async toggleSubtask(id: string, toggleSubtaskDto: ToggleSubtaskDto) {
    const subtask = await this.prisma.subtask.findUnique({ where: { id } });
    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }
    return this.prisma.subtask.update({
      where: { id },
      data: { isCompleted: toggleSubtaskDto.isCompleted },
    });
  }
}
