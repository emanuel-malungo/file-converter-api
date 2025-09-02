import prisma from "../config/databse"
import { generateApiKey } from "../utils/apiKeyUtils";
import type IUser from "../interfaces/IUser";

export async function registerUser(email: string): Promise<IUser> {
  const apiKey = generateApiKey();
  const user = await prisma.user.create({
    data: {
      email,
      apiKey,
    },
    include: {
      requests: true
    }
  });
  return user;
}

export async function getUserByApiKey(apiKey: string): Promise<IUser | null> {
  const user = await prisma.user.findUnique({
    where: { apiKey },
    include: {
      requests: true
    }
  });
  return user;
}
