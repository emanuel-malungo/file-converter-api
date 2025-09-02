import type { Request, Response } from "express";
import { registerUser as registerUserService } from "../services/userService";

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
      user
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}
