import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

try {
  await connectRabbitMQ();
} catch (error) {
  console.error(
    "Failed to connect to RabbitMQ, continuing without consumer:",
    error,
  );
}

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/rider", riderRoutes);

const PORT = Number(process.env.PORT) || 5005;

app.listen(PORT, () => {
  console.log(`Utils service running on port ${PORT}`);
  connectDB();
});
