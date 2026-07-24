import express from "express";
import connectDB from "./config/db.js";
import dotenv from 'dotenv'

const app = express();

dotenv.config()

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  connectDB();
});