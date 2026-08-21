import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { CreateGuestDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createGuestSession(dto: CreateGuestDto) {
    const guest = await this.prisma.guestUser.create({
      data: { name: dto.name.trim() },
    });

    // Give each new guest a starter board so the workspace is not empty
    await this.prisma.board.create({
      data: {
        name: 'Platform Launch',
        guestUserId: guest.id,
        columns: {
          create: [
            {
              name: 'Todo',
              tasks: {
                create: [
                  {
                    title: 'Build UI for onboarding flow',
                    description:
                      'Define user inputs, styles, validations, and frontend testing scripts.',
                    status: 'Todo',
                    position: 0,
                    subtasks: {
                      create: [
                        { title: 'Sign up page', isCompleted: true },
                        { title: 'Sign in page', isCompleted: false },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: 'Doing',
              tasks: {
                create: [
                  {
                    title: 'Design database schemas',
                    description: 'Write Prisma schema and migrations.',
                    status: 'Doing',
                    position: 0,
                    subtasks: {
                      create: [
                        { title: 'Define relations', isCompleted: true },
                        { title: 'Write seed scripts', isCompleted: false },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: 'Done',
              tasks: {
                create: [
                  {
                    title: 'Project kickoff',
                    description: 'Align on design and milestones.',
                    status: 'Done',
                    position: 0,
                    subtasks: {
                      create: [{ title: 'Confirm requirements', isCompleted: true }],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: guest.id,
      name: guest.name,
    });

    return {
      accessToken,
      guest: {
        id: guest.id,
        name: guest.name,
        createdAt: guest.createdAt,
      },
    };
  }

  async getMe(guestId: string) {
    const guest = await this.prisma.guestUser.findUnique({ where: { id: guestId } });
    return guest
      ? { id: guest.id, name: guest.name, createdAt: guest.createdAt }
      : null;
  }
}
