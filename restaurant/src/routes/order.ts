import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchSingleOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.js";

const router = express.Router();

router.get("/myOrder", isAuth, getMyOrders);
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/restaurant/:restaurantId", isAuth, fetchRestaurantOrders);
router.get("/:id", isAuth, fetchSingleOrder);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);

export default router;
