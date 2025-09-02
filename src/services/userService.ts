import prisma from "../config/databse"
import { generateApiKey } from "../utils/apiKeyUtils";

export async function registerUser(email: string): Promise<void> {
  const apiKey = generateApiKey();
  await prisma.user.create({
    data: {
      email,
      apiKey,
    },
  });
}
