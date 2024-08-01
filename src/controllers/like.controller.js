import { any } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {  Like, Likes } from "../modules/like.module";


const toggleLike = asyncHandler(async(req,res)=>{




})


const toggleTweetLike = asyncHandler(async(req,res)=>{})
const toggleCommentLike = asyncHandler(async(req,res)=>{})


const toggleVideoLike = asyncHandler(async(req,res)=>{
   const  {videoId} = req.params;

   if(!videoId){
    throw new ApiError(402,"Cannot get the video id !")
   }

   const result = await Like.updateOne(
    { },
    [
      {
        $set: {
          video: {
            $cond: {
              if: { $in: [videoId, "$video"] },
              then: {
                $filter: {
                  input: "$video",
                  as: "vid",
                  cond: { $ne: ["$$vid", videoId] }
                }
              },
              else: {
                $concatArrays: ["$video", [videoId]]
              }
            }
          }
        }
      }
    ]
  );
})
const getLikedVideos = asyncHandler(async(req,res)=>{})












export {
    toggleLike,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}