import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
// MY IMPORTS
import CustomError from "../utils/custom.error.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  // get n-id and check if its provided or not
  const { clerkId } = getAuth(req);
  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new CustomError("no user found ", 404);
  }
  // get noti from db
  const notifications = await Notification.findOne({ to: user._id })
    .sort({ createdAt: -1 })
    .populate([
      { path: "from", select: "username firstName lastName profilePicture" },
      { path: "post", select: "content image" },
      { path: "comment", select: "content" },
    ]);

  // send noti to frontend
  res.status(200).json({ notifications });
});
export const deleteNotification = asyncHandler(async (req, res) => {
  // noti id fronm fe and userid
  const { clerkId } = getAuth(req);
  const { notificationId } = req.params;

  // check for both and return if not
  if (!clerkId || !notificationId) {
    throw new Error("user id or notificaitonid not provided");
  }

  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new CustomError("user not found");
  }
  // delete the noti
  await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  // send data to frontend
  res.status(200).json({
    message: "notification deleted",
  });
});
