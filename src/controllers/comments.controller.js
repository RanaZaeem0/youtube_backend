import mongoose from "mongoose";
import { Comment } from "../modules/comments.module.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createcomment = asyncHandler(async(req,res)=>{
  
    const userId = req.user?._id
   const {content} = req.body
    const {videoId} = req.params;

    if(!userId){
        throw new ApiError(401,
            "Unable to get user id"
        )
    }
    if(!content.length >1){
        throw new ApiError(401,
            "Unable to get content "
        )
    }
    
    if(!videoId){
        throw new ApiError(401,
            "Unable to get video id"
        )
    }

    const createCommet = await Comment.create(
        {
            content:content,
            owner:req.user._id,
            video:videoId
        }
    )

    if(!createCommet){
        throw new ApiError(401,"Unable to add comment on the video")
    }

    res.status(201)
    .json(
        new ApiResponse(200,createCommet,"commnet on video success")
    )
    
})

const deleteComment  = asyncHandler(async(req,res)=>{
 
  const {commentId} = req.params
  if(!commentId){
    throw new ApiError(401,
        "unable to get  the commentId"
    )
}
const deleteComment = await Comment.findByIdAndDelete(
    commentId
)

if(!deleteComment){
    throw new ApiError(401,
        "unable to delete the comment"
    )
}
   res.status(201)
   .json(
    new ApiResponse(200,deleteComment,"Comment delete sucessfully")
   )  


})

const updateComment  =asyncHandler(async (req,res)=>{
    const commentId = req.quary
   const content = req.body
   if(!content.length >1){
    throw new ApiError(401,"Unabel to get content")
   }
     
    if(!commentId){
        throw new ApiError(401,'unable to get comment id')
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
             content:content
            }
        },{
            new :true
        }
    )

  if(!updateComment){
    throw new ApiError(401,"Unable to update Comment")
  }

  res.status(201)
  .json(
    new ApiResponse(200,updateComment,"comment Update successfulyy")
  )
})

const getAllComments = asyncHandler(async(req,res)=>{

    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(401,"canot get videoID")
    }
   
    const getAllComments = await Comment.aggregate([
        {
          $match: {
            video: new mongoose.Types.ObjectId(`${videoId}`)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "owner", // Ensure this matches the field in your comments collection
            foreignField: "_id", // Ensure this matches the field in your users collection
            as: "commentUser", // Adjust the alias name if needed
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
          $unwind: "$commentUser" // Unwind the array if you need to flatten it
        }
      ]);
      
      console.log(getAllComments);
      


  
if(!getAllComments){
    throw new ApiError("Unable to get the commnets")
}
res.status(201)
.json(
    new ApiResponse(200,getAllComments,"all com")
)

})


export {
    getAllComments,
    updateComment,
    createcomment,
    deleteComment
}