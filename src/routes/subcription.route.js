import { Router } from "express";
import { getSubscribedChannels,getUserChannelSubscribers, toggleSubscription } from "../controllers/subcribetion.controllor.js";
import { verfiyJwt } from "../middleware/auth.middleware.js";



const router  = Router()

router.route('/:channalId')
.post(verfiyJwt,toggleSubscription)
router.route('/:channalId').get(
    getSubscribedChannels,
)
router.route('/all/:channalId')
.get(getUserChannelSubscribers)





export default router