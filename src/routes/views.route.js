import express from "express"
import { Router } from "express"
import {addViewsVideo} from "../controllers/views.controler.js"

const router  = Router()



router.route('/').post(addViewsVideo)


export default router