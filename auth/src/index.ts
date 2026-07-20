import express from "express";
import dotenv from "dotenv";

import authRoute from "./routes/auth.js";

import connectDB from "./config/db.js";


const app = express();

dotenv.config();

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
