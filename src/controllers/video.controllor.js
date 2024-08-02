import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../modules/video.module.js";
import mongoose, { Schema } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js"
import { upload } from "../middleware/multer.middleware.js"

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (new mongoose.Types.ObjectId(id)).toString() === id;
const uploadVideo = asyncHandler(async (req, res) => {

    const vediodataSchema = zod.object(
        {
            title: zod.string(),
            description: zod.string(),
            duration: zod.string(),
            views: zod.string(),
            isPublished: zod.string(),
        }

    )

    const validateVedioData = vediodataSchema.safeParse(req.body)

    if (!validateVedioData.success) {
        throw new ApiError(402, "vedeo data is not vaidle")
    }

    const { title, description, duration, views, isPublished } = validateVedioData.data
    const vedioLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;


    if (!vedioLocalPath) {
        throw new ApiError(402, "vedio local path is not avalible")
    } else if (!thumbnailLocalPath) {
        throw new ApiError(402, "thumbnil  local path is not avalible")

    }

    const uploadedVedioData = await uploadOnCloudinary(vedioLocalPath)
    const uploadedThumbnailData = await uploadOnCloudinary(thumbnailLocalPath)


    if (!uploadedVedioData) {
        throw new ApiError(402, "vedio is not upload on cloud")
    } else if (!uploadedThumbnailData) {
        throw new ApiError(402, "thumnial  is not upload on cloud")
    }

    const getuserId = req?.user?._id
    if (!getuserId) {
        throw new ApiError(403, "can ont user id")
    }
    const video = await Video.create({
        title,
        description,
        duration,
        views,
        isPublished,
        videoFile: uploadedVedioData.url,
        thumbnail: uploadedThumbnailData.url,
        owner: req.user?.id
    })

    if (!video) {
        throw new ApiError(401, "error occur during upload video")
    }

    res.status(201)
        .json(
            new ApiResponse(200, video, "video update successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req?.params
    
        
    if (!videoId || isValidObjectId(userId))  {
        throw new ApiError(402, "cannot get the vedioID")
    }

    const getSingleVideo = await Video.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(`${videoId}`)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "owner", // Adjust localField if needed
            foreignField: "_id", // Adjust foreignField if needed
            as: "userData",
            pipeline: [
              {
                $project: {
                  avatar: 1,
                  username: 1,
                  email: 1
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "videoLikes",
            pipeline: [
              {
                $count: "totalLikes" // This will count the number of likes
              }
            ]
          }
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
                  content: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            videoLikes: {
              $arrayElemAt: ["$videoLikes.totalLikes", 0] // Extract the count from the result
            }
          }
        }
      ]);
      

//    write quary for the watch history

    if (!getSingleVideo) {
        throw new ApiError(402, "cannot be the vedio with this id")
    }



    res.status(201)
        .json(
            new ApiResponse(200,  getSingleVideo , "video get successfully")
        )



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req?.params()

    if (!videoId) {
        throw new ApiError(402, "cannot get the vedioID")
    }

    const video = Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(402, "cannot be the vedio with this id")
    }

    res.status(201)
        .json(
            new ApiResponse(200, video, "video deleted  successfully")
        )
})
const toggleIsPusblish = asyncHandler(async (req, res) => {
    const videoId = req?.params()

    if (!videoId) {
        throw new ApiError(402, "cannot get the vedioID")
    }

    const video = await Video.updateOne(
        {
            _id: videoId
        },
        {
            $set: {
                isPublished: !isPublished
            }
        }
    )

    if (!video) {
        throw new ApiError(402, "cannot be the vedio with this id")
    }

    res.status(201)
        .json(
            new ApiResponse(200, video, "video deleted  unpublish or publish")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {


  const setLimit = Number(req.params?.limit)
  console.log(setLimit,"asdsad");
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = setLimit ||4; // Set limit to 30
    const query = req.query.query || ''; // Filter query
    const sortBy = 'createdAt'; // Sort by createdAt
    const sortType = -1; // -1 for descending to get latest videos first
   




    const allVideo =  await Video.aggregate([
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"UserDetails",
                pipeline:[
                    {
                        $addFields:{
                            UserDetails:{
                                $first:"$UserDetails"
                            }
                        }
                    },
                    {
                        $project:{
                            avatar:1,
                            username:1,
                            email:1
                        }
                    }
                ]

            }
            

        }
    ])
    .sort({ [sortBy]: sortType }) // Sort by createdAt in descending order
    .skip((page - 1) * limit) // Skip documents based on page number
    .limit(limit) // Limit to 30 documents per page
    .exec(); // Execute the query
    
    if(!allVideo){
        throw new ApiError(401,"error canot get all video")
    }

    

    res.status(201)
    .json(
        new ApiResponse(200,allVideo)
    )




})



export {
    uploadVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
    toggleIsPusblish
}