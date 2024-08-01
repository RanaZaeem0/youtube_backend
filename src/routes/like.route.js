import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";
import {verfiyJwt} from "../middleware/auth.middleware.js"

const router = Router()

router.use(verfiyJwt)
router.route('/:videoId')
.get(getLikedVideos)
.patch(toggleVideoLike)

router.route('/:commentId')
.patch(toggleCommentLike)





export default router