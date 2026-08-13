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
