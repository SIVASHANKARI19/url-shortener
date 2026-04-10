
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});


// Test connection on startup
prisma.$connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Fail fast instead of serving broken requests
  });

module.exports = prisma;