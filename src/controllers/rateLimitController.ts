import type { Response } from 'express';
import type { IAuthenticatedRequest } from '../interfaces/IAuthenticatedRequest';
import { getRateLimitStatus } from '../middlewares/rateLimitMiddleware';

export const getRateLimitStatusController = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const status = await getRateLimitStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Erro ao buscar status do rate limit:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
