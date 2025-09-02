import { Router } from "express";
import { registerUser } from "../controllers/userController";

const router = Router();

router.post("/users", registerUser);

export default router;
