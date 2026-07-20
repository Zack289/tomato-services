import jwt from "jsonwebtoken";

import User from "../model/user.js";
import tryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser = tryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  const googleResponse = await oauth2client.getToken(code);

  oauth2client.setCredentials(googleResponse.tokens);

  const userRes =
    await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}
    `);

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(200).json({ message: "Loggin success", token, user });
});

//to verify the roles

const allowedRoles = ["customer", "rider", "seller"] as const;

type Role = (typeof allowedRoles)[number];

export const addUserRole = tryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.json({ user, token });
});

//fetching the account

export const myProfile = tryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});
