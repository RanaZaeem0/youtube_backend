import { User } from "../modules/user.module.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verfiyJwt = asyncHandler(async function (req, res, next) {

    
  try {
     const  token = req.cookies?.accesstoken || req.headers['authorization']?.replace('Bearer ', '');        
  
          if (!token) {
            
              throw new ApiError(401, 'Unaothorize Request')
          }
  
          const validateToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
          if (!validateToken) {
              throw new ApiError(401, "Access token is not valide")
          }
  
          const user = await User.findById(validateToken?._id).select('-password -refreshToken')
          if(!user){
            throw new ApiError(440,"cannot find the user with token id")
          }
  
          req.user = user
          next()
  } catch (error) {
    console.log(error);
    throw new ApiError(444,"authization falied")
  }
    

})


export {verfiyJwt}



