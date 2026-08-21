import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

const boardInclude = {
  columns: {
    include: {
      tasks: {
        orderBy: { position: 'asc' as const },
        include: { subtasks: true },
      },
    },
  },
};

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(guestUserId: string) {
    return this.prisma.board.findMany({
      where: { guestUserId },
      include: boardInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, guestUserId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: boardInclude,
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    if (board.guestUserId !== guestUserId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async create(createBoardDto: CreateBoardDto, guestUserId: string) {
    const { name, columns } = createBoardDto;

    return this.prisma.board.create({
      data: {
        name,
        guestUserId,
        columns: columns
          ? {
              create: columns.map((col) => ({ name: col.name })),
            }
          : undefined,
      },
      include: boardInclude,
    });
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, guestUserId: string) {
    const board = await this.findOne(id, guestUserId);
    const { name, columns } = updateBoardDto;

    return this.prisma.$transaction(async (tx) => {
      if (name) {
        await tx.board.update({
          where: { id },
          data: { name },
        });
      }

      if (columns) {
        const existingColumns = board.columns;
        const incomingIds = columns
          .filter((col) => col.id)
          .map((col) => col.id as string);

        const columnsToDelete = existingColumns.filter(
          (col) => !incomingIds.includes(col.id),
        );

        for (const col of columnsToDelete) {
          await tx.column.delete({ where: { id: col.id } });
        }

        for (const col of columns) {
          if (col.id) {
            const ownsColumn = existingColumns.some((c) => c.id === col.id);
            if (!ownsColumn) {
              throw new ForbiddenException('Invalid column reference for this board');
            }
            await tx.column.update({
              where: { id: col.id },
              data: { name: col.name },
            });
          } else {
            await tx.column.create({
              data: {
                name: col.name,
                boardId: id,
              },
            });
          }
        }
      }

      return tx.board.findUnique({
        where: { id },
        include: boardInclude,
      });
    });
  }

  async remove(id: string, guestUserId: string) {
    await this.findOne(id, guestUserId);
    return this.prisma.board.delete({ where: { id } });
  }
}
