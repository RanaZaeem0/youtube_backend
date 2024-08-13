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
  const userId = req.user?._id
  console.log(req.user);

  if (!videoId) {
    throw new ApiError(402, "Cannot get the video id !")
  }
  if (!userId) {
    throw new ApiError(402, "Canot get userid")
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

  const userId = req.user._id

  if (!userId) {
    throw new ApiError(401, "Cannot getuserid")
  }


  const userLikeVideo = await Like.aggregate([
    {
      $match: {
        likedBy: userId
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "VideoData",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ChannalDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    email: 1,
                    avatar: 1
                  }
                }
              ]
            }
          }
        ]
      }
    },
  

  ]);




  console.log(userLikeVideo);

  if (!userLikeVideo) {
    throw new ApiError(401, "cannot get like with this vidoe")
  }
  res.status(201)
    .json(
      new ApiResponse(200, userLikeVideo, "get all of the video ")
    )
})


const getUserLikeVideo = asyncHandler(async (req, res) => {
  const userId = req.user._id
  console.log(req);

  if (!userId) {
    throw new ApiError(401,
      "Unable to get ht user id"
    )
  }



  if (!userLikeVideo) {
    throw new ApiError(402, "Unable to get all like video")
  }

  res.status(201).
    json(
      new ApiResponse(201, userLikeVideo, "All get like video sucessss")
    )

})









export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getUserLikeVideo
}