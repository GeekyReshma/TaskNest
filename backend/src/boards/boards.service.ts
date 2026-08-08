import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.board.findMany({
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return board;
  }

  async create(createBoardDto: CreateBoardDto) {
    const { name, columns } = createBoardDto;
    return this.prisma.board.create({
      data: {
        name,
        columns: columns
          ? {
              create: columns.map((col) => ({
                name: col.name,
              })),
            }
          : undefined,
      },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id);
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
        const incomingIds = columns.filter((col) => col.id).map((col) => col.id as string);

        // Delete columns not present in incoming list
        const columnsToDelete = existingColumns.filter((col) => !incomingIds.includes(col.id));
        for (const col of columnsToDelete) {
          await tx.column.delete({
            where: { id: col.id },
          });
        }

        // Create or update columns
        for (const col of columns) {
          if (col.id) {
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
        include: {
          columns: {
            include: {
              tasks: {
                orderBy: { position: 'asc' },
                include: { subtasks: true },
              },
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.board.delete({
      where: { id },
    });
  }
}
