import type { Response, NextFunction } from 'express';
import prisma from '../config/databse';
import type { IAuthenticatedRequest } from '../interfaces/IAuthenticatedRequest';

const MONTHLY_REQUEST_LIMIT = 100;

export const rateLimitMiddleware = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Calcular o primeiro dia do mês atual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Contar requisições do usuário no mês atual
    const requestCount = await prisma.request.count({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Verificar se ultrapassou o limite
    if (requestCount >= MONTHLY_REQUEST_LIMIT) {
      res.status(429).json({
        error: 'Limite de requisições mensais excedido',
        limit: MONTHLY_REQUEST_LIMIT,
        used: requestCount,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      });
      return;
    }

    // Registrar a requisição atual
    await prisma.request.create({
      data: {
        userId: userId,
        endpoint: req.originalUrl || req.url
      }
    });

    // Adicionar headers informativos sobre o rate limit
    res.set({
      'X-RateLimit-Limit': MONTHLY_REQUEST_LIMIT.toString(),
      'X-RateLimit-Remaining': (MONTHLY_REQUEST_LIMIT - requestCount - 1).toString(),
      'X-RateLimit-Reset': new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime().toString()
    });

    next();
  } catch (error) {
    console.error('Erro no middleware de rate limit:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getRateLimitStatus = async (userId: number) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const requestCount = await prisma.request.count({
    where: {
      userId: userId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  return {
    limit: MONTHLY_REQUEST_LIMIT,
    used: requestCount,
    remaining: MONTHLY_REQUEST_LIMIT - requestCount,
    resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
};
