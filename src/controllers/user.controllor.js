import { asyncHandler } from "../utils/asyncHandler.js"
import zod from "zod"
import { ApiError } from '../utils/ApiError.js'
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
const loginDataCheck = zod.object({
    email: zod.string().email()
    , password: zod.string().min(2)

})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken =   user.generateAccessToken()
        
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong during cretion of acess token and refreshtoken")
    }



}
const registerUser = asyncHandler(async (req, res) => {
    //   take data from frontend
    console.log("user reach hrer");
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

    if (!avatarLocalPath) {
        throw new ApiError(402, "Avatar image local path dont avalible does not execit")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)
    console.log(avatar, "avatar ho ma");


    const user = await User.create({
        fullName: fullName,
        username,
        email,
        password,
        coverImage: coverImage?.url || "",
        avatar: avatar.url
    })

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(403, "User is not created in database")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User is created successfully"))





})

const loginUser = asyncHandler(async (req, res) => {

    // get email,password
    const { email, password, username } = req.body
    const validateLogin = loginDataCheck.safeParse({ email, password, username })
    if (!validateLogin.success) {
        throw new ApiError(402, "user Input is not correct")
    }
    // check the user is exict
    const user = await User.findOne({
        '$or': [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "Email or userName  is incorrect")
    }
    
    const passwordIsValide = await user.isPasswordCorrect(password)

    if (!passwordIsValide) {
        throw new ApiError(400, "passwrid is not valide")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
    console.log(accessToken,refreshToken);
    console.log("after");
    const loginUser = await User.findById(user._id).select("-password -refreshToken")
    // const loginUser = await User.findById(user._id).select('-password -refreshToken');


    if (!loginUser) {
   throw new ApiError(404,"login User is not there")
    }
    const options = {
        httpOnly: true,
        secure: true
    }


    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options).json(
            new ApiResponse(200, {
                user: loginUser, accessToken, refreshToken
            },
                "User logined in successFully "
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

})

export { registerUser, loginUser }