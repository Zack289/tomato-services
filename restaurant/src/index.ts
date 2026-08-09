import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import restaurantRoutes from "./routes/restaurant.js";
import itemRoutes from "./routes/menuItem.js";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startPaymentConsumer } from "./config/payment.consumer.js";

const app = express();

dotenv.config();

try {
  await connectRabbitMQ();
  startPaymentConsumer();
} catch (error) {
  console.error("Failed to connect to RabbitMQ, continuing without consumer:", error);
}

app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
  connectDB();
});
