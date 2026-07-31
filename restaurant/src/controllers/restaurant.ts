import jwt from "jsonwebtoken";
import axios from "axios";

import getBuffer from "../config/dataUri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import tryCatch from "../middlewares/tryCatch.js";
import Restaurant from "../models/Restaurant.js";

export const addRestaurant = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { name, description, latitude, longitude, formattedAddress, phone } =
      req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const existingRestaurant = await Restaurant.findOne({
      ownerId: user._id,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        message: "You already have a Restaurant!",
      });
    }

    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        message: "Please give all the details!",
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

    const restaurant = await Restaurant.create({
      name,
      description,
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formattedAddress,
      },
      isVerified: false,
    });

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  },
);

export const fetchMyRestaurant = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
      return res.status(400).json({
        message: "No restaurant found!",
      });
    }

    if (!req.user.restaurantId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        },
      );

      return res.json({ restaurant, token });
    }

    res.json({ restaurant });
  },
);

//function to update the status of the restaurant

export const updateStatusRestaurant = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({ message: "Status must be boolean" });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { isOpen: status },
      { new: true },
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    res.json({
      message: "Restaurant status updated successfully",
      restaurant,
    });
  },
);

//function to update the restaurant

export const updateRestaurant = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { name: name, description: description },
      { new: true },
    );

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    res.json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  },
);

//to fetch nearby restaurant

export const getNearbyRestaurant = tryCatch(async (req, res) => {
  const { latitude, longitude, radius = 5000, search = "" } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      message: "Latitude and longitude are required!",
    });
  }

  const query: any = {
    isVerified: true,
  };

  //enable both capital and small alphabets
  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }
  const restaurant = await Restaurant.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true,
        query,
      },
    },

    {
      $sort: {
        //sort restaurant according to the conditions
        isOpen: -1,
        distance: 1,
      },
    },

    {
      $addFields: {
        distanceKm: {
          //round the km value in exact digit like 1.2 km = 1km
          $round: [{ $divide: ["$distance", 1000] }, 2],
        },
      },
    },
  ]);

  res.json({
    success: true,
    count: restaurant.length,
    restaurant,
  });
});

// to fetch single restaurant

export const fetchSingleRestaurant = tryCatch(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  res.json(restaurant);
});
