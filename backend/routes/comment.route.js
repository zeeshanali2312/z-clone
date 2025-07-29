import { Router } from "express";


// my imports 
import {authMiddleware} from '../middleware/auth.middleware.js'
import { createComment, deleteComment, getComments } from "../controllers/comment.controller.js";
const router= Router();

// api/v1/comments

// public
router.get("/post/:postId",getComments);

//protected
router.post("/post/:postId",authMiddleware,createComment);
router.delete("/:commentId",authMiddleware,deleteComment);


export default router;