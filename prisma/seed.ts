import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

await prisma.$connect();

await prisma.user.create({
  data: {
    name: 'John Doe',
    posts: {
      create: [
        { title: 'Hello World' },
        { title: 'Hello World 2' },
        { title: 'Hello World 3' },
      ],
    },
  },
});

await prisma.$disconnect();
