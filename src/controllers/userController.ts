import type { Request, Response } from "express";
import type { IAuthenticatedRequest } from "../interfaces/IAuthenticatedRequest.js";
import { registerUser as registerUserService } from "../services/userService.js";

export async function registerUser(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email é obrigatório"
      });
    }

    const user = await registerUserService(email);
  
    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          apiKey: user.apiKey,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      message: "Usuário registrado com sucesso"
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}

export async function getUserProfile(req: IAuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Usuário não autenticado"
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}
