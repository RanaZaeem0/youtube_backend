import { User } from "../modules/user.module.js";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verfiyJwt = asyncHandler(async function (req, res, next) {

    try {
        const token = req.cookies?.accesstoken || req.headers('Authorization')?.replace('Bearer ', "")

        if (!token) {
            throw new ApiError(401, 'Unaothorize Request')
        }

        const validateToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!validateToken) {
            throw new ApiError(401, "Access token is not valide")
        }

        const user = User.findById(validateToken?._id).select('-password -refreshToken')

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(402, "ERROR: occur  during auth")
    }

})


export {verfiyJwt}



