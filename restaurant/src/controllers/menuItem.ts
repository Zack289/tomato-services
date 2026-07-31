import axios from "axios";
import getBuffer from "../config/dataUri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import tryCatch from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.js";
import menuItems from "../models/menuItems.js";

export const addMenuItem = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Please login" });
  }

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

  if (!restaurant) {
    return res.status(404).json({
      message: "No Restaurant Found",
    });
  }

  const { name, description, price } = req.body;

  if (!name && !price) {
    return res.status(400).json({
      message: "Name and price are required",
    });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please give image!",
    });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "Failed to create file buffer!",
    });
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    },
  );

  const item = await menuItems.create({
    name,
    description,
    price,
    restaurantId: restaurant._id,
    image: uploadResult.url,
  });

  res.json({ message: " Item Added Successfully", item });
});

//funtion to fetch all the items

export const getAllItems = tryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }

  const items = await menuItems.find({ restaurantId: id });

  res.json(items);
});

//to delete menu item

export const deleteMenuItem = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please login" });
    }

    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "Id is required" });
    }

    const item = await menuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "No Restaurant Found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Menu item deleted successfully",
    });
  },
);

//to toggle item avalability

export const toggleMenuItemAvaliblity = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please login" });
    }

    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "Id is required" });
    }

    const item = await menuItems.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "No item found",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "No Restaurant Found",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      message: `Item marked as ${item.isAvailable ? "Available" : "Unavailable"}`,
      item,
    });
  },
);
