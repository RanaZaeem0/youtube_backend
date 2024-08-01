import { Router } from "express";
import { createATweet, deleteTweet, getAllTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verfiyJwt } from "../middleware/auth.middleware.js";



const router = Router()
router.use(verfiyJwt)
router.route('/:tweetId')
.patch(updateTweet)
router.route('/:tweetId').delete(deleteTweet)

router.route('/')
.get(getAllTweet)
.post(createATweet)


export default router