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


router.route(verfiyJwt,'/:videoId')
.post(createcomment).patch(updateComment)
router.route(verfiyJwt,'/:commentId').delete(deleteComment)

router.route('/all/:videoId').get(getAllComments)



export default router