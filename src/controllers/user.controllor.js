import { asyncHandler } from "../utils/asyncHandler.js"
import zod from "zod"
import ApiError from '../utils/ApiError.js'
import { User } from "../modules/user.module.js"
import { upload } from "../middleware/multer.middleware.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const UserDataCheck = zod.object({
    username: zod.string().min(2),
    email: zod.string().email()
    , fullName: zod.string().min(2)
    , password: zod.string().min(2)

})


const registerUser = asyncHandler(async (req, res) => {
    //   take data from frontend
    const { username, fullName, password, email } = req.body

    const validate = UserDataCheck.safeParse({
        username: username,
        password: password,
        fullName: fullName,
        email: email

    })
    if (!validate.success) {
        throw new ApiError(400, "user data is not valid",)
    }

    const exictedUser = await User.findOne({
        "or": [{ username }, { email }]
    })

    if (exictedUser) {
        throw new ApiError(401, "User Name or email is Alredy Exicted")
    }

              const avatarLocalPath = req.files?.avatar[0]?.path
              const coverLocalPath = req.files?.coverImage[0]?.path
 
    if(!avatarLocalPath){
        throw new  ApiError(402, "Avatar image local path dont avalible does not execit")
    }
  const avatar = uploadOnCloudinary(avatarLocalPath)
  const coverImage = uploadOnCloudinary(coverLocalPath)

   const user = await  User.create({
        fullName,
        username,
        email,
        password,
        coverImage:coverImage?.url || "",
        avatar:avatar.url
    })

  const createdUser  = await User.findOne(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(403,"User is not created in database")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User is created successfully"))


 


})

export { registerUser }