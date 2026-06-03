import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const storedBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = (await scrypt(password, salt, keyLength)) as Buffer;

  if (storedBuffer.length !== suppliedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, suppliedBuffer);
}
