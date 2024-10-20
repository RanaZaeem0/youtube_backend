import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modules/user.module.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { json } from "express";


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
        console.log(error + "acces tokn");

        throw new ApiError(
            500,
            "Somthing went wrong during cretion of acess token and refreshtoken"
        );
    }
};
const registerUser = asyncHandler(async (req, res) => {
    try {

        const UserDataCheck = zod.object({
            username: zod.string().min(2),
            email: zod.string().email(),
            password: zod.string().min(2),
        });
        console.log(req.body ,"daas");

        //   take data from frontend
        console.log(req.body);
        const { username, password, email } = req.body;
        console.log(req.body);

        const validate = UserDataCheck.safeParse({
            username: username,
            password: password,
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

        const avatarLocalPath = req?.files?.avatar?.[0]?.path;
        const coverLocalPath = req?.files?.coverImage?.[0]?.path;
        
    
        let avatar
        if(avatarLocalPath){
            avatar = await uploadOnCloudinary(avatarLocalPath);
        }
        let coverImage
        if(coverLocalPath){
             coverImage = await uploadOnCloudinary(coverLocalPath);
        }


       
       
        // console.log(avatar, "avatar ho ma");

        const user = await User.create({
            username,
            email,
            password,
            coverImage: coverImage?.url || "",
            avatar: avatar?.url || "",
        });

        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
            user._id
        );

        if (!user) {
            throw new ApiError(401,
                "user is not creted"
            )
        }

        const createdUser = await User.findOne(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(403, "User is not created in database");
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(201)
            .cookie('refreshToken', refreshToken, options)
            .cookie('accessToken', accessToken, options)

            .json(
                new ApiResponse(
                    200,
                    {
                        user: createdUser,
                        accessToken,
                        refreshToken,
                    },
                    "User Created successFully "
                )
            );
    } catch (error) {
        throw new ApiError(401, error)
    }

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
    console.log(user._id);

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
    console.log(req.user._id);
    await console.log(req.user._id);
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

    return res.status(201)
        .clearCookie('refreshToken', options)
        .clearCookie('accessToken', options)
        .json(
            new ApiResponse(200, {}, "user logout sucees")
        )
});

const changeCurrentPassword = asyncHandler(async function (req, res) {

    const zodpasswordData = zod.object({
        oldPassword: zod.string(),
        newPassword: zod.string()
    })

    const valiedPassworddata = zodpasswordData.safeParse(req.body)

    const { oldPassword, newPassword } = valiedPassworddata.data


    if (!valiedPassworddata.success) {
        throw new ApiError(440, "oldpassord or newpasssword can not get")
    }
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(401, "request user if is not valied");
    }
    console.log(oldPassword);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

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


    const inComingRefreshToken = req.body?.refreshToken;

    if (!inComingRefreshToken) {
        throw new ApiError(402, "Cannot get token on incmong reqest");
    }
    console.log(inComingRefreshToken, "incoing")

    let decodedToken;
    try {
        decodedToken = jwt.decode(inComingRefreshToken);
    } catch (error) {
        console.error("Token verification error:", error);
        throw new ApiError(401, "Invalid or expired refresh token.");
    }

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

    return res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            { refreshToken, accessToken },
            "token is updated successfully"
        )
    );

});
const getCurrentUser = asyncHandler(async function (req, res) {
    return res
        .status(201)
        .json(new ApiResponse(200, req.user, "this is the user details"));
});

const updateAccountDetails = asyncHandler(async function (req, res) {


    const updateZodschema = zod.object({
        email: zod.string(),
    })
    const validateUpdateData = updateZodschema.safeParse(req.body)

    if (!validateUpdateData.success) {
        throw new ApiError(401, "emial  is requide");
    }
    const { email } = validateUpdateData.data;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(401, "Error : cannot finf User with this Id");
    }

    const updateUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
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
    console.log(req.file);
    const newAvatarLocalPath = req.file?.path;

    if (!newAvatarLocalPath) {
        throw new ApiError(201, "new avatar local path is not define");
    }

    const uploadNewAvatar = await uploadOnCloudinary(newAvatarLocalPath);

    if (!uploadNewAvatar) {
        throw new ApiError(402, "error Avatar is not on cloud");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: uploadNewAvatar.url,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(402, "something withWorng when update the avatar");
    }
    return res
        .status(201)
        .json(new ApiResponse(200, user, "avatar image update sccucessfully"));
});
const updateUserCoverImage = asyncHandler(async function (req, res) {
    const { newCoverImageLocalPath } = req.files?.coverImage?.path;

    if (!newCoverImageLocalPath) {
        throw new ApiError(201, "new coverImage local path is not define");
    }

    const uploadNewcoverImage = await uploadOnCloudinary(newCoverImageLocalPath);

    if (!uploadNewcoverImage) {
        throw new ApiError(402, "error coverImage is not on cloud");
    }

    const user = await User.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                coverImage: uploadNewcoverImage.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    if (!user) {
        throw new ApiError(402, "something withWorng when update the cover image");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, user, "Cover Image update sccucessfully"));
});

const getUserChannalProfile = asyncHandler(async (req, res) => {
    const encodedUsername = req.params.username;

    const username = decodeURIComponent(encodedUsername)
    if (!username?.trim()) {
        ApiError(402, "cannot get  username ");
    }
    const userId = req?.headers.userid;
    console.log(userId);
    const channal = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channal",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribeTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channalsSubscribedToCount: {
                    $size: "$subscribeTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(userId), "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channal?.length) {
        throw new ApiError(440, "Channal does not excited");
    }
    res
        .status(201)
        .json(new ApiResponse(200, channal[0], "Channl data get sccuessfully"));
});

const getWatchHistry = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        email: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }

                        }
                    }
                ],
            },
        },

    ]);


    return res.status(201)
        .json(
            new ApiResponse(200, user[0].watchHistory, "user watch histroy data get sccuess fully")
        )

});

const UserWatchHisroy = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(401, "Unable to get Userid")
    }
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(401, "Unable to get the Videoid")
    }

    const addVideo = await User.findOneAndUpdate(
        {
            _id: userId
        },
        {
            $push: { watchHistory: videoId }
        }, {
        new: true,
        projection: { watchHistory: 1 }
    },

    )
    if (!addVideo) {
        throw new ApiError(401, "Unable to add video in user History")
    }

    res.status(201)
        .json(
            new ApiResponse(200, addVideo, "video add scuuess in user history")
        )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannalProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistry,
    UserWatchHisroy
};
