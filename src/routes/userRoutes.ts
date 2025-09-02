import { Router } from "express";
import { registerUser, getUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Rota pública para registro de usuário
router.post("/users", registerUser);

// Rota protegida para obter perfil do usuário
router.get("/users/profile", authMiddleware, getUserProfile);

export default router;
