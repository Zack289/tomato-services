import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  addMenuItem,
  deleteMenuItem,
  getAllItems,
  toggleMenuItemAvaliblity,
} from "../controllers/menuItem.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addMenuItem);
router.get("/all/:id", isAuth, getAllItems);
router.delete("/:id", isAuth, isSeller, deleteMenuItem);
router.put("/status/:id", isAuth, isSeller, toggleMenuItemAvaliblity);

export default router;
