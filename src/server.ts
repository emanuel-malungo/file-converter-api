import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
