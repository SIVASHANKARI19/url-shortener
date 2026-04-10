// Load env FIRST before anything else
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Before ALL tests run
beforeAll(async () => {
  await prisma.click.deleteMany();
  await prisma.url.deleteMany();
  await prisma.user.deleteMany();
});

// After ALL tests finish
afterAll(async () => {
  await prisma.click.deleteMany();
  await prisma.url.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});