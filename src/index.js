import express from "express"
const app =express()
import connectDB from "./db/index.js"

import dotenv from "dotenv"

dotenv.config({
    path:'../env'
})

connectDB()
app.get('/',(req,res)=>{
    res.json({
        msg:"teh is t"
    })
})


app.listen(3000)