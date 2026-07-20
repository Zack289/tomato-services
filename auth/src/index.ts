import express from "express";
import dotenv from "dotenv";
import cors from "cors"

import authRoute from "./routes/auth.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  connectDB();
});
