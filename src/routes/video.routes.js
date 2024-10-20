import express from "express"
import {     uploadVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
    toggleIsPusblish,
   
    getUserVideos,
    getChannalVideo} from "../controllers/video.controllor.js"
import {upload} from "../middleware/multer.middleware.js"
import { verfiyJwt } from "../middleware/auth.middleware.js"


const videoRoute = express.Router()




videoRoute.post('/publish',
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1

        }
    ]),verfiyJwt, uploadVideo)
videoRoute.get('/allvideo/:limit',getAllVideos)
videoRoute.get('/:videoId',getVideoById)
videoRoute.get('/channalvideo/:username',getChannalVideo)
videoRoute.route('/').get(verfiyJwt,getUserVideos)
videoRoute.delete('/:videoId',verfiyJwt,deleteVideo)
videoRoute.patch('/:videoId',verfiyJwt,toggleIsPusblish)


export { videoRoute }