import  { v2 as cloudinary } from "cloudinary"
import { log } from "console";
import fs from 'fs'
import { TokenExpiredError } from "jsonwebtoken";
import { loadEnvFile } from "process";



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary = async(fileLocalPath)=>{
  try {
  if(!fileLocalPath) return console.log('filelocalpath error');
  
  const response = await cloudinary.uploader.upload(fileLocalPath,{
    resource_type:"auto"
  })
 
  console.log(`file uploaded on cloudinary ${response}`);
 return response.url

  } catch (error) {
    fs.unlinkSync(fileLocalPath)
    return console.log(`Error during upload `);

  }
}

export {uploadOnCloudinary}