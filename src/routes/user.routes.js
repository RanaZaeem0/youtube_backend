import express from "express"
import { asyncHandler } from "../utils/asyncHandler.js"
import { loginUser, registerUser } from "../controllers/user.controllor.js"
import { upload } from "../middleware/multer.middleware.js"


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

userRoute.get('/register', (req, res) => {
    res.json({
        msg: "dadasd sd sa"
    })
})

export { userRoute }