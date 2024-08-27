import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../modules/video.module.js";
import mongoose, { Schema, set } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middleware/multer.middleware.js";
import { User } from "../modules/user.module.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  new mongoose.Types.ObjectId(id).toString() === id;

const uploadVideo = asyncHandler(async (req, res) => {
  const vediodataSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
  });
  const { title, description } = req.body;
  const validateVedioData = vediodataSchema.safeParse({
    title: title,
    description: description,
  });
  if (!validateVedioData.success) {
    throw new ApiError(402, "vedeo data is not vaidle");
  }

  console.log(req.files, title, description);

  const vedioLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!vedioLocalPath) {
    throw new ApiError(402, "vedio local path is not avalible");
  } else if (!thumbnailLocalPath) {
    throw new ApiError(402, "thumbnil  local path is not avalible");
  }

  const uploadedVedioData = await uploadOnCloudinary(vedioLocalPath);
  const uploadedThumbnailData = await uploadOnCloudinary(thumbnailLocalPath);

  if (!uploadedVedioData) {
    throw new ApiError(402, "vedio is not upload on cloud");
  } else if (!uploadedThumbnailData) {
    throw new ApiError(402, "thumnial  is not upload on cloud");
  }

  const getuserId = req?.user?._id;
  if (!getuserId) {
    throw new ApiError(403, "can ont user id");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: uploadedVedioData.url,
    thumbnail: uploadedThumbnailData.url,
    owner: req.user?.id,
  });

  if (!video) {
    throw new ApiError(401, "error occur during upload video");
  }

  res
    .status(201)
    .json(new ApiResponse(200, video, "video update successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req?.params;

  if (!(videoId || isValidObjectId(videoId))) {
    throw new ApiError(402, "cannot get the vedioID");
  }
  // This is pass my Localvarible
  const userId = req?.headers.userid;
   console.log(userId , typeof(userId));
   
  const getSingleVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${videoId}`),
      },
    },
 
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channalDetails",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channal",
              as: "subscribers",
            },
          },
   
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },

              isSubscribed: {
                $cond: {
                  if: {
                    $in: [
                      new mongoose.Types.ObjectId(userId),
                      "$subscribers.subscriber",
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "videoLikes",
        pipeline: [
          {
            $count: "totalLikes", // This will count the number of likes
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
        pipeline: [
          {
            $project: {
              content: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoLikes: {
          $arrayElemAt: ["$videoLikes.totalLikes", 0], // Extract the count from the result
        },
      },
    },
  ]);

  //    write quary for the watch history

  if (!getSingleVideo) {
    throw new ApiError(402, "cannot be the vedio with this id");
  }

  res
    .status(201)
    .json(new ApiResponse(200, getSingleVideo, "video get successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req?.params();

  if (!videoId) {
    throw new ApiError(402, "cannot get the vedioID");
  }

  const video = Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(402, "cannot be the vedio with this id");
  }

  res
    .status(201)
    .json(new ApiResponse(200, video, "video deleted  successfully"));
});
const toggleIsPusblish = asyncHandler(async (req, res) => {
  const videoId = req?.params();

  if (!videoId) {
    throw new ApiError(402, "cannot get the vedioID");
  }

  const video = await Video.updateOne(
    {
      _id: videoId,
    },
    {
      $set: {
        isPublished: !isPublished,
      },
    }
  );

  if (!video) {
    throw new ApiError(402, "cannot be the vedio with this id");
  }

  res
    .status(201)
    .json(new ApiResponse(200, video, "video deleted  unpublish or publish"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const setLimit = Number(req.params?.limit);
  console.log(setLimit, "asdsad");
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = setLimit || 4; // Set limit to 30
  const query = req.query.query || ""; // Filter query
  const sortBy = "createdAt"; // Sort by createdAt
  const sortType = -1; // -1 for descending to get latest videos first

  const results = await Video.aggregate([
    {
      $facet: {
        metadata: [
          { $count: "total" }, // Get the total number of documents
        ],
        data: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "channalDetails",
              pipeline: [
                {
                  $addFields: {
                    UserDetails: {
                      $first: "$channalDetails",
                    },
                  },
                },
                {
                  $project: {
                    avatar: 1,
                    username: 1,
                    email: 1,
                    total: ``,
                  },
                },
              ],
            },
          },
          { $sort: { [sortBy]: sortType } }, // Sort by the specified field
          { $skip: (page - 1) * limit }, // Skip documents based on the page number
          { $limit: limit }, // Limit to the specified number of documents per page
        ],
      },
    },
    {
      $addFields: {
        "metadata.total": { $arrayElemAt: ["$metadata.total", 0] }, // Extract total count
      },
    },
    {
      $addFields: {
        hasMore: {
          $cond: {
            if: { $gt: ["$metadata.total", { $multiply: [limit, page] }] }, // Check if more pages are available
            then: true,
            else: false,
          },
        },
      },
    },
  ]).exec();

  const videos = results[0].data;
  const hasMore = results[0].hasMore;

  if (!videos) {
    throw new ApiError(401, "error canot get all video");
  }

  res
    .status(201)
    .json(new ApiResponse(200, [videos, { hasMore }], "vies get succeses"));
});

const getUserVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "cannot get User Id");
  }

  const UserVideo = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "UserDetails",
        pipeline: [
          {
            $addFields: {
              UserDetails: {
                $first: "$UserDetails",
              },
            },
          },
          {
            $project: {
              username: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!UserVideo) {
    throw new ApiError(401, "unable to get the user id");
  }

  res.status(201).json(new ApiResponse(200, UserVideo, "Get all user Video"));
});

const getChannalVideo = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    ApiError(402, "cannot get  username ");
  }

  const channalVideo = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "ChannalVideo",
      },
    },

    {
      $project: {
        ChannalVideo: 1,
      },
    },
  ]);

  if (!channalVideo?.length) {
    throw new ApiError(440, "Channal does not excited");
  }
  res
    .status(201)
    .json(
      new ApiResponse(200, channalVideo, "channal video  data get sccuessfully")
    );
});

export {
  uploadVideo,
  getChannalVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  toggleIsPusblish,
  getUserVideos,
};
