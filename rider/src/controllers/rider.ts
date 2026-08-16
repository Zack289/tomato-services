import axios from "axios";
import getBuffer from "../config/dataUri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import tryCatch from "../middlewares/tryCatch.js";
import { Rider } from "../model/rider.js";

export const addRiderProfile = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to generate image buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const {
      phoneNumber,
      nidNumber,
      drivingLicenceNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !nidNumber ||
      !drivingLicenceNumber ||
      !latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400).json({
        message: "All fields are reuired",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (!existingProfile) {
      res.status(400).json({
        message: "Rider profile already exist",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      nidNumber,
      drivingLicenceNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isAvailable: false,
      isVerified: false,
    });

    return res.status(201).json({
      message: "Rider profile created successfully",
      riderProfile,
    });
  },
);

export const fetchMyProfile = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });

    res.json(account);
  },
);

export const toogleRiderAvailibility = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const { isAvailable, latitude, longitude } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be boolean",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    const rider = await Rider.findOne({ userId: user._id });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    if (isAvailable && !rider.isVerified) {
      return res.status(403).json({
        message: "Rider is not verified",
      });
    }

    rider.isAvailable = isAvailable;

    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailable ? "Rider is not online" : "Rider is offline",
      rider,
    });
  },
);

export const acceptOrder = tryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId) {
    return res.status(400).json({
      message: "Please login",
    });
  }

  const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true });

  if (!rider) {
    return res.status(404).json({
      message: "Rider not found",
    });
  }

  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    if (data.success) {
      const riderDetails = await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailable: true,
        },
        { isAvailable: false },
        { new: true },
      );

      res.json({ message: "Order accepted" });
    }
  } catch (error) {
    res.status(400).json({
      message: "Order already taken",
    });
  }
});

export const fetchMyCurrentOrder = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if (!riderUserId) {
      return res.status(400).json({
        message: "Please login",
      });
    }

    const rider = await Rider.findOne({
      userId: riderUserId,
      isAvailable: true,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      res.json({
        order: data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

export const updateOrderStatus = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Please login",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      res.json({
        message: data.message,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);
