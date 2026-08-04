import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import tryCatch from "../middlewares/tryCatch.js";
import Address from "../models/Address.js";

export const addAddress = tryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json({
      message: "Unauthorized",
    });
  }

  const { mobile, formattedAddress, latitude, longitude } = req.body;

  if (
    !mobile ||
    !formattedAddress ||
    latitude === undefined ||
    longitude === undefined
  ) {
    res.status(400).json({
      message: "Please give all fields",
    });
  }

  const newAddress = await Address.create({
    userId: user._id.toString(),
    mobile,
    formattedAddress,
    location: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    },
  });

  res.json({
    message: "Address added successfully",
    address: newAddress,
  });
});

// function to delete address

export const deleteAddress = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const address = await Address.findOne({
      _id: id,
      userId: user._id.toString(),
    });

    if (!address) {
      res.status(404).json({
        message: "Address not found",
      });
    }

    await address?.deleteOne();

    res.json({
      message: "Address deleted successfully",
    });
  },
);

// function to delete get address

export const getMyAddresses = tryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }

    const addresses = await Address.find({
      userId: user._id.toString(),
    }).sort({ createdAt: -1 });

    res.json({
      addresses,
    });
  },
);
