import { Router } from "express";
import { verfiyJwt } from "../middleware/auth.middleware.js";
import {
    getAllComments,
    updateComment
    ,
    createcomment,
    deleteComment
} from "../controllers/comments.controller.js"

const router = Router()

router.route('/')
router.route('/:videoId')
.post(verfiyJwt,createcomment).patch(verfiyJwt,updateComment)
router.route('/:commentId').delete(verfiyJwt,deleteComment)

router.route('/all/:videoId').get(getAllComments)



export default router