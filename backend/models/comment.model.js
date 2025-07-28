import mongoose, { Schema } from "mongoose";

const comemntSchema = new Schema(
  {
    //user,  post , content , like
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 240,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", comemntSchema);

export default Comment;
