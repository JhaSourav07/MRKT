import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compareRoutes from "./routes/compareRoutes.js";
import { connectDB } from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/compare", compareRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Engine is running" });
});

app.listen(PORT, () => {
  console.log(`Smart Price Engine running on http://localhost:${PORT}`);
});
