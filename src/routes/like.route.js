import { Router } from "express";
import { getLikedVideos, getUserLikeVideo, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";
import {verfiyJwt} from "../middleware/auth.middleware.js"

const router = Router()

router.route('/:videoId')
.patch(verfiyJwt,toggleVideoLike)

router.route(verfiyJwt,'/:commentId')
.patch(verfiyJwt,toggleCommentLike)
router.route('/likeVideo').get(
    verfiyJwt,getLikedVideos
)



export default router