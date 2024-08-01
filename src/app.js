import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app =express()
app.use(cors({
    origin: `${process.env.CORS_ORGION}`,
    credentials: true
}))


app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())


import { userRoute } from "./routes/user.routes.js"
import { videoRoute } from "./routes/video.routes.js"
import playlist from "./routes/playlist.route.js"
import subsciption from "./routes/subcription.route.js"
import CommentRoute from "./routes/comments.route.js"


app.use('/api/v1/users',userRoute)
app.use('/api/v1/video',videoRoute)
app.use('/api/v1/playlist',playlist)
app.use('/api/v1/subscription',subsciption)
app.use('/api/v1/comment',CommentRoute)








app.get('/', (req, res) => {
    res.json({
        msg: "app"
    })
})

export {app}