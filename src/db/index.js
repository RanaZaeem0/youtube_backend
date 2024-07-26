import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";
import express from "express"
const app = express()

const connectDB = async () => {
    try {
        const connectInstanse = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.log(`erorr  ${error }`);
        })
        console.log(`your connect host ${connectInstanse.connection.host}`);
    } catch (error) {
        console.log(`Error ${error}`);
        process.exit(1)
    }
}






export default connectDB