import { asyncHandler } from "../utils/asyncHandler.js"
import zod from "zod"
import ApiError from '../utils/ApiError.js'
import { User } from "../modules/user.module.js"

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

    const exictedUser = User.findOne({
        "or": [{ username }, { email }]
    })

    if (exictedUser) {
        throw new ApiError(401, "User Name or email is Alredy Exicted")
    }

    const avatarLocalPath = req.files?.avatar[0]?path;
    const coverImageLocalPath = req.files?.coverImage[0]?path;


    if(!avatarLocalPath){

    } 



})

export { registerUser }