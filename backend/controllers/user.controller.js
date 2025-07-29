import  asyncHandler  from "express-async-handler";
import { getAuth, clerkClient } from "@clerk/express";
import mongoose from "mongoose";

// MY IMPORTS
import CustomError from "../utils/custom.error.js";
import User from "../models/user.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  // get username fronm frontend
  const { username } = req.params;
  if (!username) {
    throw new CustomError("username not found", 404);
  }
  // check if the user is in the db
  const user = await User.findOne({ username });
  if (!user) {
    throw new CustomError("user not found !", 401);
  }

  // send details of user to frontend
  res.status(200).json({ user });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  // get the auth id from getAuth (clerk)
  const { clerkId } = getAuth(req);

  if (!clerkId) {
    throw new Error("Clerk id not found", 400);
  }
  // check in db if user exists
  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new CustomError("user not found ", 404);
  }

  res.status(200).json({ user });

  // send data to frontend
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  // get user from getauth
  const { clerkId } = getAuth(req);
  if (!clerkId) {
    throw new CustomError("clerk id not found ", 401);
  }

  // update the details in db
  const user = await User.findOneAndUpdate({ clerkId }, req.body, {
    new: true,
  });
  if (!user) {
    throw new CustomError("no user found ", 404);
  }

  // send data to frontend
  res.status(200).json({ user });
});

export const syncUser = asyncHandler(async (req, res) => {
  // get data from clerk
  const { clerkId } = getAuth(req);
  if (!clerkId) {
    throw new CustomError("clerkid not found", 404);
  }
  // check if user is in db or not
  const existingUser = await User.findOne({ clerkId });
  if (existingUser) {
    throw new CustomError("user already exsits", 400);
  }

  // create user in db if not found
  const clerkUser = await clerkClient.users.getUser(clerkId);

  const user = await User.create({
    clerkId,
    email: clerkUser.emailAddresses[0].emailAddress,
    username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    profilePicture: clerkUser.imageUrl || "",
  });

  // send data to backend
  res.status(201).json({
    success: true,
    message: "user created succefully",
    user,
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  // get userid and targetid
  const { userId } = getAuth(req);
  const targetId = req.params;

  if (!userId || !targetId) {
    throw new Error("user not found", 404);
  }
  // check for both user and targetid
  const user = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetId);

  if (!user || !targetUser) {
    throw new CustomError("user not found", 404);
  }

  //  check for follow and unfollow
  const isFollowed = user.followings.includes(targetId);

  // logic to folow and unfollow user
  try {
    session.startTransaction();

    if (isFollowed) {
      // unfollow
      await User.findByIdAndUpdate(
        user._id,
        {
          $pull: { followings: targetId },
        },
        { session }
      );

      await User.findByIdAndUpdate(
        targetId,
        {
          $pull: { followers: userId },
        },
        { session }
      );
    } else {
      // follow
      await User.findByIdAndUpdate(
        user._id,
        {
          $push: { followings: targetId },
        },
        { session }
      );

      await User.findByIdAndUpdate(
        targetId,
        {
          $push: { followers: user._id },
        },
        { session }
      );

      await Notification.create(
        [
          {
            from: user._id,
            to: targetId,
            type: "follow",
          },
        ],
        { session }
      );
    }

    session.commitTransaction();
  } catch (error) {
    session.abortTransaction();
  } finally {
    session.endSession();
  }

  res
    .status(200)
    .json({ message: isFollowed ? "user unfollowed" : "user follwed " });
});
