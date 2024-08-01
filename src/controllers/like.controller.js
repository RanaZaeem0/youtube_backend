import { any } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../modules/like.module.js";
import { ApiResponse } from "../utils/ApiResponse.js";





const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id
  if (!tweetId) {
    throw new ApiError(402, "Cannot get the video id !")
  }

  const alredyExicted = await Like.findOne({
    tweet: tweetId,
    likedBy: userId
  })
  if (alredyExicted) {
    const unliketweet = await Like.findOneAndDelete(
      {
        tweet: tweetId,
        likedBy: userId
      }
    )

    if (!unliketweet) {
      throw new ApiError(401, "unable to get delete like")
    }
    res.status(201).json(
      new ApiResponse(200, unliketweet, "Unlike Sucess")
    )

  } else {
    const liketweet = await Like.create(
      {
        tweet: tweetId,
        likedBy: userId
      }
    )
    if (!liketweet) {
      throw new ApiError(401, "unable to get add like")
    }
    res.status(201).json(
      new ApiResponse(200, liketweet, "addlike  Sucess")
    )

  }
 })
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id
  if (!commentId) {
    throw new ApiError(402, "Cannot get the video id !")
  }

  const alredyExicted = await Like.findOne({
    comment: commentId,
    likedBy: userId
  })
  if (alredyExicted) {
    const unlikecomment = await Like.findOneAndDelete(
      {
        comment: commentId,
        likedBy: userId
      }
    )

    if (!unlikecomment) {
      throw new ApiError(401, "unable to get delete like")
    }
    res.status(201).json(
      new ApiResponse(200, unlikecomment, "Unlike Sucess")
    )

  } else {
    const likecomment = await Like.create(
      {
        comment: commentId,
        likedBy: userId
      }
    )
    if (!likecomment) {
      throw new ApiError(401, "unable to get add like")
    }
    res.status(201).json(
      new ApiResponse(200, likecomment, "addlike  Sucess")
    )



 }
})

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id
  if (!videoId) {
    throw new ApiError(402, "Cannot get the video id !")
  }

  const alredyExicted = await Like.findOne({
    video: videoId,
    likedBy: userId
  })
  if (alredyExicted) {
    const unlikeVideo = await Like.findOneAndDelete(
      {
        video: videoId,
        likedBy: userId
      }
    )

    if (!unlikeVideo) {
      throw new ApiError(401, "unable to get delete like")
    }
    res.status(201).json(
      new ApiResponse(200, unlikeVideo, "Unlike Sucess")
    )

  } else {
    const likeVideo = await Like.create(
      {
        video: videoId,
        likedBy: userId
      }
    )
    if (!likeVideo) {
      throw new ApiError(401, "unable to get add like")
    }
    res.status(201).json(
      new ApiResponse(200, likeVideo, "addlike  Sucess")
    )
  }



  if (!result) {
    throw new ApiError(401, "Unable to update like data")
  }

  res.status(201)
    .json(
      new ApiResponse(200, result, "sccuess")
    )
})
const getLikedVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "Unable to get vidoe id")
  }



  const likedVideos = await Like.find(
    {
        likedBy: req.user._id,
        video:{$ne: null}
    }
).populate("video")



  console.log(likedVideos);

  if(!likedVideos){
    throw new ApiError(401,"cannot get like with this vidoe")
  }
res.status(201)
.json(
  new ApiResponse(200,likedVideos,"get all of the video ")
)
})












export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}