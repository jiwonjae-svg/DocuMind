import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { readDemoSeedCredentials } from "./seed-policy.mjs";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

function requireDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  return connectionString;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength);

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const adapter = new PrismaPg({ connectionString: requireDatabaseUrl() });
  const prisma = new PrismaClient({ adapter });

  const { email, password } = readDemoSeedCredentials();

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo User",
      passwordHash,
    },
    create: {
      email,
      name: "Demo User",
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "demo_user_seeded",
      resourceType: "User",
      resourceId: user.id,
      metadata: {
        email: user.email,
      },
    },
  });

  await prisma.$disconnect();
  console.log(`Seeded demo user: ${user.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
