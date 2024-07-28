import express from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllor.js"
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

userRoute.get('/register', (req, res) => {
    res.json({
        msg: "dadasd sd sa"
    })
})

export { userRoute }