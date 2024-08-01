import { Tweet } from "../modules/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




const createATweet   =  asyncHandler(async(req,res)=>{


    const userId = req.user._id

    const {content}  = req.body

    if(!content.length > 1){
        throw new ApiError(401,"cannot get content")
    }

   if(!userId){
    throw new ApiError(401,"Unable to get User Id")
   }

   const createTweet  = await Tweet.create({
    owner:userId,
    content

   })

   if(!createTweet){
    throw new ApiError(401,"Unable to create a tweet")
   }

   res.status(201)
   .json(
    new ApiResponse(200,createTweet,"Create Tweet successfully")
   )
})

const deleteTweet = asyncHandler(async(req,res)=>{

const {tweetId} = req.params
if(!tweetId){
    throw new ApiError(401,"Unable to get the tweetid")
}

const deleteTweet = await Tweet.findByIdAndDelete({
    _id:tweetId,
    owner:req.user._id
})

if(!deleteTweet){
    throw new ApiError(401,"unable to delelte the tweet")
}
res.status(201)
.json(
    new ApiResponse(200,deleteTweet,"Tweet delted successfully")
)
})


const updateTweet = asyncHandler(async(req,res)=>{

    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(401,"Unable to get the tweetid")
    }
    const {content}  = req.body

    if(!content.length > 1){
        throw new ApiError(401,"cannot get content")
    }


    
    const update = await Tweet.findOneAndUpdate({_id:tweetId},
        {
            content:content
        },
        {
            new:true
        }
    )
    
    if(!update){
        throw new ApiError(401,"unable to delelte the tweet")
    }
    

    res.status(201
    ).json(
        new ApiResponse(200,update,"Tweet data update Successfully")
    )

    })


    const getAllTweet = asyncHandler(async(req,res)=>{
        const userId = req.user._id

        if(!userId){
            throw new ApiError(401,
                "Unable to get ht user id"
            )
        }

        const alltweet = await Tweet.find(
            {
                owner:userId
            }
        )

        if(!alltweet){
            throw new ApiError(402,"Unable to get all tweet")
        }

        res.status(201).
        json(
            new ApiResponse(201,alltweet,"All get sucessss")
        )

    })



    export{
    updateTweet,
    createATweet,
    deleteTweet,
    getAllTweet
     }

