import { validateApiKey } from "../utils/apiKeyUtils";
import type { Response, NextFunction } from "express";
import type { IAuthenticatedRequest } from "../interfaces/IAuthenticatedRequest";
import prisma from "../config/databse";

export async function authMiddleware(req: IAuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Extrai a API key do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Token de autorização não fornecido"
      });
    }

    // Espera formato: "Bearer API_xxxxx" ou apenas "API_xxxxx"
    const apiKey = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Valida o formato da API key
    if (!validateApiKey(apiKey)) {
      return res.status(401).json({
        status: "error",
        message: "Formato de API key inválido"
      });
    }

    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: {
        id: true,
        email: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "API key inválida"
      });
    }

    // Adiciona o usuário à requisição para uso nos controladores
    req.user = user;
    
    next();
  } catch (error: any) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      status: "error",
      message: "Erro interno do servidor"
    });
  }
}
