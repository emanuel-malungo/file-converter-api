import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js";
import rateLimitRoutes from "./routes/rateLimitRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import compressionRoutes from "./routes/compressionRoutes.js";

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

// Rotas de conversão de arquivos
app.use("/api/convert", conversionRoutes);

// Rotas de OCR
app.use("/api/ocr", ocrRoutes);

// Rotas de compressão
app.use("/api/compress", compressionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
