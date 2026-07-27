import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import restaurantRoutes from "./routes/restaurant.js";

const app = express();

dotenv.config();

app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/restaurant", restaurantRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
  connectDB();
});
