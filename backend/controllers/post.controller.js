import  asyncHandler  from "express-async-handler";
import { getAuth } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// MY IMPORTS
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getUserPosts,
  likePost,
} from "../routes/post.route.js";
import Post from "../models/post.model.js";
import CustomError from "../utils/custom.error.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

export const getAllPosts = asyncHandler(async (req, res) => {
  // get all post from db .
  const posts = await Post.find()
    .sort({ createAt: -1 })
    .populate([
      { path: "user", select: "username firstName lastName profilePicture " },
      {
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePicture ",
        },
      },
    ]);
  if (!posts) {
    throw new CustomError("no posts found ", 404);
  }
  // send the posts to fornend
  res.status(200).json({ posts });
});
export const getPost = asyncHandler(async (req, res) => {
  // get postid from fe
  const { postId } = req.params;
  if (!postId) {
    throw new CustomError("post id not found", 404);
  }
  // find the post and send data to fe
  const post = await Post.findById(postId).populate([
    { path: "user", select: "username firstName lastName profilePicture " },
    {
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    },
  ]);

  if (!post) {
    throw new CustomError("no post found");
  }

  res.status(200).json({ post });
});
export const getUserPosts = asyncHandler(async (req, res) => {
  // get username from fe
  const { username } = req.params;
  if (!username) {
    throw new CustomError("username not found", 401);
  }
  // check if user exsits or not
  const user = await User.findOne({ username });
  if (!user) {
    throw new CustomError("user not found");
  }
  // find the post
  const posts = await Post.find({ user: user._id })
    .sort({ createAt: -1 })
    .populate([
      { path: "user", select: "username firstName lastName profilePicture" },
      {
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePicture",
        },
      },
    ]);

  if (!posts) {
    throw new CustomError("no post found", 404);
  }

  // send the data to fe
  res.status(200).json({ posts });
});
export const createPost = asyncHandler(async (req, res) => {
  // get userId , file , content from fe
  const { userId } = getAuth(req);
  const { imageFile } = req.file;
  const { content } = req.body;

  // check for userid , if user is present or not
  if (!imageFile && !content) {
    throw new CustomError("both cannot be empty ");
  }

  if (!userId) {
    throw new CustomError("userid not found");
  }

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    throw new CustomError("no user found ");
    hr;
  }

  // convert the image to base64  and upload it to cloudinary
  if (imageFile) {
    const base64Image = `data:${
      imageFile.mimetype
    },base64,{${imageFile.buffer.toString("base64")}}`;
  }

  let imageUrl = "";

  try {
    // get the image from cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "social_media_posts",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "auto" },
      ],
    });

    imageUrl = uploadResponse.secure_url;
  } catch (error) {
    console.error("cloudinary error", error);
    res.status(400).json({ message: "falied to upload image" });
  }

  // save the data to db
  const post = await Post.create({
    user: user._id,
    image: imageUrl,
    content: content || "",
  });
  // send the data to frontend
  res.status(201).json({ post });
});
export const likePost = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  // get user id , postid
  const { clerkId } = getAuth(req);
  const { postId } = req.params;

  if (!clerkId || !postId) {
    throw new CustomError("user or postid not given", 404);
  }
  // check if user and post both in bd
  const user = await User.findOne({ clerkId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    throw new Error("user or post not found");
  }
  const isLiked = post.likes.includes(user._id);

  // logic for like and unlike the post
  try {
    session.startTransaction();
    if (isLiked) {
      // unlike the post
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: user._id },
        },
        { session }
      );
    } else {
      await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: user._id } },
        { session }
      );

      // create notification if not self post
      await Notification.create(
        [
          {
            from: user._id,
            to: post.user,
            type: "like",
            post: postId,
          },
        ],
        { session }
      );
    }

    session.commitTransaction();
    // send message to backend
    res.status(200).json({ message: isLiked ? "post unliked" : "post liked" });
  } catch (error) {
    session.abortTransaction();
    console.error("operation failed ", error);
    res.status(400).json({ message: "falied to performe task" });
  } finally {
    session.endSession();
  }
});
export const deletePost = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();

  // get postid from fe
  const { postId } = req.params;
  const { clerkId } = getAuth(req);
  if (!postId) {
    throw new CustomError("postId not given");
  }

  // check for post and user
  const user = await User.findOne({ clerkId });
  const post = await Post.findById(postId);

  if (!post || !user) {
    throw new CustomError("post or user not found");
  }

  if (user._id.toString() !== post.user.toString()) {
    throw new CustomError("you can only delete your posts");
  }
  try {
    session.startTransaction();
    // delete related comments and then post
    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);
    session.commitTransaction();
  } catch (error) {
    console.error("transaction error", error);
    session.abortTransaction();
  } finally {
    session.endSession();
  }
  // send status to fe
  res.status(200).json({ message: "post is deleted" });
});
