import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import tryCatch from "../middlewares/tryCatch.js";
import cart from "../models/cart.js";

export const addToCart = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login!",
    });
  }

  const userId = req.user._id;

  const { restaurantId, itemId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(restaurantId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return res.status(400).json({
      message: "Invalid restaurant and item id!",
    });
  }

  const cartFromDiffRestaurant = await cart.findOne({
    userId,
    restaurantId: { $ne: restaurantId }, //to prevent adding items in cart from multiple reestaurant at a time
  });

  if (cartFromDiffRestaurant) {
    return res.status(400).json({
      message:
        "You can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant",
    });
  }

  const cartItem = await cart.findOneAndUpdate(
    //to increment the existing item
    { userId, restaurantId, itemId },
    {
      $inc: { quantity: 1 },
      $setOnInsert: { userId, restaurantId, itemId },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.json({
    message: "Item added to cart ",
    cart: cartItem,
  });
});

// to fetch the cart items
export const fetchMyCart = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login!",
    });
  }

  const userId = req.user._id;

  const cartItems = await cart
    .find({ userId })
    .populate("itemId")
    .populate("restaurantId");

  let subTotal = 0;
  let cartLength = 0;

  for (const cartItem of cartItems) {
    const item: any = cartItem.itemId;

    subTotal += item.price * cartItem.quantity;
    cartLength += cartItem.quantity;
  }

  return res.json({
    success: true,
    cartLength,
    subTotal,
    cart: cartItems,
  });
});
