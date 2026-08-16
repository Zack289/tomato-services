import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  acceptOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyProfile,
  toogleRiderAvailibility,
  updateOrderStatus,
} from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);

router.get("/myProfile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toogleRiderAvailibility);
router.post("/accept/:orderId", isAuth, acceptOrder);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.put("/order/update/:orderId", isAuth, updateOrderStatus);

export default router;
