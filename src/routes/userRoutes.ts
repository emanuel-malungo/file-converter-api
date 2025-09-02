import { Router } from "express";
import { registerUser, getUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { rateLimitMiddleware } from "../middlewares/rateLimitMiddleware";

const router = Router();

// Rota pública para registro de usuário
router.post("/register", registerUser);

// Rota protegida para obter perfil do usuário (com rate limit)
router.get("/profile", authMiddleware, rateLimitMiddleware, getUserProfile);

export default router;
