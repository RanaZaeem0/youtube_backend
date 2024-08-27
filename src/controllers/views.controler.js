import { views } from "../modules/views.module.js";
import { asyncHandler } from "../utils/asyncHandler.js";




const addViewsVideo = asyncHandler( async (req,res)=>{

    const {video,owner} = req.body

    const addview = await views.insertMany(
        {
            owner:owner,
            video:video
        }
    )


    console.log(addview);
    

})

export  {
    addViewsVideo
}