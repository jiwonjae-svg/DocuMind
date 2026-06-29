import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { readSeedCredentials } from "./seed-policy.mjs";

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

  const { email, password } = readSeedCredentials();

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Seed User",
      passwordHash,
    },
    create: {
      email,
      name: "Seed User",
      passwordHash,
    },
    select: {
      id: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "seed_user_created",
      resourceType: "User",
      resourceId: user.id,
      metadata: {
        method: "seed",
      },
    },
  });

  await prisma.$disconnect();
  console.log("Seeded bootstrap user.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
