import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
  connectDB();
});
