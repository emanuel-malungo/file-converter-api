import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes";
import rateLimitRoutes from "./routes/rateLimitRoutes";

dotenv.config();
const app = express();
app.use(compression());
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de usuários (registro público + rotas protegidas com rate limit)
app.use("/api/users", userRoutes);

// Rotas para verificar status do rate limit
app.use("/api/rate-limit", rateLimitRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
