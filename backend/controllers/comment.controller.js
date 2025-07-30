import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";

// my imports
import Comment from "../models/comment.model.js";
import CustomError from "../utils/custom.error.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const getComments = asyncHandler(async (req, res) => {
  // get postid from fe
  const { postId } = req.params;
  if (!postId) {
    throw new CustomError("post id not found ", 400);
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new CustomError("no post found");
  }
  // get the comments from the post id
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate([
      { path: "user", select: "username firstName lastName profilePicture" },
    ]);

  // send to fe
  res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  // postId , content , userId,
  const { clerkId } = getAuth(req);
  const { content } = req.body;
  const { postId } = req.params;

  if (!clerkId || !content || !postId) {
    throw new CustomError("missing filed error", 404);
  }
  const user = await User.findOne({ clerkId }).lean();
  const post = await Post.findById(postId).lean();

  if (!post || !user) {
    throw new CustomError("user or post not found");
  }
  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  });

  //link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });
  // create notification
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      comment: comment._id,
    });
  }

  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  // get comment id and userid from getauth
  const { commentId } = req.params;
  const { clerkId } = getAuth(req);

  // check for comment and post and user
  const user = await User.findOne({ clerkId }).lean();
  const comment = await Comment.findById(commentId).lean();

  if (!user || !comment) {
    throw new CustomError("user or comment not found", 404);
  }
  // check if its user who commented
  if (comment.user.toString() !== user._id.toString()) {
    throw new CustomError("you can only delete your comment", 403);
  }
  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  // send message to frontend
  res.status(200).json({ message: "comment deleted" });
});
