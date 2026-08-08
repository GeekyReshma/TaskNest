import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.subtask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});

  console.log('Seed: database cleared.');

  // Create Platform Launch Board
  const board1 = await prisma.board.create({
    data: {
      name: 'Platform Launch',
      columns: {
        create: [
          {
            name: 'Todo',
            tasks: {
              create: [
                {
                  title: 'Build UI for onboarding flow',
                  description: 'Define user inputs, styles, validations, and frontend testing scripts.',
                  status: 'Todo',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Sign up page design & implementation', isCompleted: true },
                      { title: 'Sign in page design & implementation', isCompleted: false },
                      { title: 'Password reset flow', isCompleted: false },
                    ],
                  },
                },
                {
                  title: 'Build onboarding backend endpoints',
                  description: 'API design, database integrations, validation schemas, and unit tests.',
                  status: 'Todo',
                  position: 1,
                  subtasks: {
                    create: [
                      { title: 'Create AuthController and AuthService', isCompleted: false },
                      { title: 'Implement JWT login verification', isCompleted: false },
                      { title: 'Add email confirmation hooks', isCompleted: false },
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
                  description: 'Write Prisma schema, database migrations, and SQLite table structures.',
                  status: 'Doing',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Define relations and schema structures', isCompleted: true },
                      { title: 'Write Prisma seed scripts', isCompleted: false },
                    ],
                  },
                },
                {
                  title: 'Configure environment variables',
                  description: 'Define and validate app ports, database URLs, and API keys.',
                  status: 'Doing',
                  position: 1,
                  subtasks: {
                    create: [
                      { title: 'Setup backend local env configs', isCompleted: true },
                      { title: 'Setup frontend local env configs', isCompleted: true },
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
                  title: 'Project Kickoff & Requirements Alignment',
                  description: 'Initial team meeting to review Figma design guidelines and project milestones.',
                  status: 'Done',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Align on design fidelity and columns', isCompleted: true },
                      { title: 'Setup git repository and root folder structures', isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create Marketing Plan Board
  const board2 = await prisma.board.create({
    data: {
      name: 'Marketing Plan',
      columns: {
        create: [
          {
            name: 'Todo',
            tasks: {
              create: [
                {
                  title: 'Draft press release',
                  description: 'Outline the launch details, partnership features, and company mission statement.',
                  status: 'Todo',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Draft first copy', isCompleted: false },
                      { title: 'Send to leadership for approval', isCompleted: false },
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
                  title: 'Social media schedule definition',
                  description: 'Plan posts for LinkedIn, Twitter, and blogs covering launch week.',
                  status: 'Doing',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Write copy for LinkedIn post', isCompleted: true },
                      { title: 'Create promo graphic templates', isCompleted: false },
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
                  title: 'Logo redesign',
                  description: 'Select final colors, fonts, and logomark versions for branding.',
                  status: 'Done',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Generate logomark iterations', isCompleted: true },
                      { title: 'Confirm official hex color codes', isCompleted: true },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Seed: database seeded successfully! Created boards: ${board1.name}, ${board2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
