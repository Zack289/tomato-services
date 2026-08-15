import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import riderRoutes from "./routes/rider.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/rider", riderRoutes);

const PORT = Number(process.env.PORT) || 5005;

app.listen(PORT, () => {
  console.log(`Utils service running on port ${PORT}`);
  connectDB();
});
