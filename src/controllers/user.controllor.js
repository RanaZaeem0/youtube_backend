import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modules/user.module.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const UserDataCheck = zod.object({
    username: zod.string().min(2),
    email: zod.string().email(),
    fullName: zod.string().min(2),
    password: zod.string().min(2),
});

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(
            500,
            "Somthing went wrong during cretion of acess token and refreshtoken"
        );
    }
};
const registerUser = asyncHandler(async (req, res) => {
    //   take data from frontend
    console.log("user reach hrer");
    const { username, fullName, password, email } = req.body;

    const validate = UserDataCheck.safeParse({
        username: username,
        password: password,
        fullName: fullName,
        email: email,
    });
    if (!validate.success) {
        throw new ApiError(400, "user data is not valid");
    }

    const exictedUser = await User.findOne({
        or: [{ username }, { email }],
    });

    if (exictedUser) {
        throw new ApiError(401, "User Name or email is Alredy Exicted");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(
            402,
            "Avatar image local path dont avalible does not execit"
        );
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log(avatar, "avatar ho ma");

    const user = await User.create({
        fullName: fullName,
        username,
        email,
        password,
        coverImage: coverImage?.url || "",
        avatar: avatar.url,
    });

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(403, "User is not created in database");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User is created successfully"));
});
const loginDataCheck = zod
    .object({
        email: zod.string().email().optional(),
        username: zod.string().min(2).optional(),
        password: zod.string().min(2),
    })
    .refine((data) => data.email || data.username, {
        message: "Either username or email is required",
        path: ["email", "username"], // This path indicates where the error should be applied
    });

const loginUser = asyncHandler(async (req, res) => {
    // get email,password
    const { email, password, username } = req.body;
    const validateLogin = loginDataCheck.safeParse({ email, password, username });
    if (!validateLogin.success) {
        throw new ApiError(402, "user Input is not correct");
    }
    // check the user is exict
    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "Email or userName  is incorrect");
    }

    const passwordIsValide = await user.isPasswordCorrect(password);

    if (!passwordIsValide) {
        throw new ApiError(400, "passwrid is not valide");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loginUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!loginUser) {
        throw new ApiError(404, "login User is not there");
    }
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loginUser,
                    accessToken,
                    refreshToken,
                },
                "User logined in successFully "
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res
        .status(200)
        .josn(
            clearCookie("refreshToken", options),
            clearCookie("accessToken", options),
            new ApiResponse(200, {}, "User is logout sccess")
        );
});

const changeCurrentPassword = asyncHandler(async function (req, res) {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(401, "request user if is not valied");
    }

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "oldpassword is not correct");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(201)
        .json(new ApiResponse(200, {}, "password is updated successfully"));
});

const refreshAccessToken = asyncHandler(async function (req, res) {
    try {
        const inComingRefreshToken =
            req.cookies?.accessToken || req.body?.accessToken;

        if (!inComingRefreshToken) {
            throw new ApiError(402, "Cannot get token on incmong reqest");
        }

        const decodedToken = jwt.verify(
            inComingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        if (!decodedToken) {
            throw new ApiError(401, "Unauthorerzie Token");
        }

        const exictedUser = await User.findById(decodedToken._id);

        if (!exictedUser) {
            throw new ApiError(401, "The id accend with this token is not exectied");
        }
        if (inComingRefreshToken !== exictedUser?.refreshToken) {
            throw new ApiError(401, "Token is valied");
        }

        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
            exictedUser._id
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        res
            .status(201)
            .json(
                cookie("refreshToken", refreshToken, options),
                cookie("accessToken", accessToken, options),
                new ApiResponse(
                    200,
                    { refreshToken, accessToken },
                    "token is updated successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, "error occur dring refreshaccesstoken ");
    }
});

const getCurrentUser = asyncHandler(async function (req, res) {
    return res
        .status(201)
        .json(new ApiResponse(200, req.user, "this is the user details"));
});

const updateAccountDetails = asyncHandler(async function (req, res) {
    const { email, fullName } = req.body;
    if (!(email || fullName)) {
        throw new ApiError(401, "emial or fullName is requide");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(401, "Error : cannot finf User with this Id");
    }

    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    if (!updateUser) {
        throw new ApiError(402, "error : somthing went during updating user data");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, user, "User data is Updated"));
});

const updateUserAvatar = asyncHandler(async function (req, res) {

    const { newAvatarLocalPath } = req.files?.avatar?.path

    if (!newAvatarLocalPath) {
        throw new ApiError(201, "new avatar local path is not define")
    }

    const uploadNewAvatar = await uploadOnCloudinary(newAvatarLocalPath)

    if (!uploadNewAvatar) {
        throw new ApiError(402, "error Avatar is not on cloud")
    }

    const user = await User.findByIdAndUpdate(
        req.User._id,
        {
            "$set": {
                avatar: uploadNewAvatar.url
            }
        }
        , {
            new: true
        }
    ).select('-password')

    if (!user) {
        throw new ApiError(402, "something withWorng when update the avatar")
    }
    return res.status(201)
    .json(
        new ApiResponse(200,
            user,"avatar image update sccucessfully"
        )
    )



})
const updateUserCoverImage = asyncHandler(async function (req, res) {

    const { newCoverImageLocalPath } = req.files?.coverImage?.path

    if (!newCoverImageLocalPath) {
        throw new ApiError(201, "new coverImage local path is not define")
    }

    const uploadNewcoverImage = await uploadOnCloudinary(newCoverImageLocalPath)

    if (!uploadNewcoverImage) {
        throw new ApiError(402, "error coverImage is not on cloud")
    }

    const user = await User.findByIdAndUpdate(
        req.User._id,
        {
            "$set": {
                coverImage:uploadNewcoverImage.url
            }
        }
        , {
            new: true
        }
    ).select('-password')

    if (!user) {
        throw new ApiError(402, "something withWorng when update the cover image")
    }

    return res.status(201)
    .json(
        new ApiResponse(200,
            user,"Cover Image update sccucessfully"
        )
    )

})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
