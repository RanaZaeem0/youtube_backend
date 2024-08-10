import express from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { changeCurrentPassword, getCurrentUser, getUserChannalProfile, getWatchHistry, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, UserWatchHisroy } from "../controllers/user.controllor.js"
import { upload } from "../middleware/multer.middleware.js"
import { verfiyJwt } from "../middleware/auth.middleware.js"


const userRoute = express.Router()

userRoute.post('/register',
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:'coverImage'
        ,maxCount:1

    }
   ])
    , registerUser)

    
userRoute.post('/login',loginUser)    
userRoute.post('/logout',verfiyJwt,logoutUser)    
userRoute.post('/refresh-token',refreshAccessToken)    
userRoute.post('/change-password',verfiyJwt,changeCurrentPassword)
userRoute.get('/current-user',verfiyJwt,getCurrentUser)

userRoute.patch('/update-account',verfiyJwt,updateAccountDetails)
userRoute.patch('/changeAvatar' ,verfiyJwt,upload.single('avatar'), updateUserAvatar)
userRoute.patch('/changeCoverImage',verfiyJwt,upload.single('coverImage'),updateUserCoverImage)

userRoute.get('/channal/:username',getUserChannalProfile)
userRoute.get('/getwatchHistory',verfiyJwt,getWatchHistry)
userRoute.post('/addWatchHistory/:videoId',verfiyJwt,UserWatchHisroy)







userRoute.get('/', (req, res) => {
    res.json({
        msg: "fine !"
    })
})

export { userRoute }