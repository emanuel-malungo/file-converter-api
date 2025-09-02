import prisma from "../config/databse.js"
import { generateApiKey } from "../utils/apiKeyUtils.js";
import type IUser from "../interfaces/IUser.js";

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
