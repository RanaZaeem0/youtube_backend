import mongoose from "mongoose";
import { Subscription } from "../modules/subcribetion.module.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "cannot get userid");
    }
    const { channalId } = req.params;

    if (!channalId) {
        throw new ApiError(401, "cannot get the channal id");
    }

    const exictedSubcriber = await Subscription.findOne({
        subscriber: userId,
        channal: channalId,
    });
    console.log(exictedSubcriber);

    if (exictedSubcriber) {
        const unSubcribeChannal = await Subscription.findByIdAndDelete(
            exictedSubcriber._id
        );
        if (!unSubcribeChannal) {
            throw new ApiError(401, "unable to subribed");
        }
        res
            .status(201)
            .json(new ApiResponse(200, unSubcribeChannal, "unSubscibe successfully"));
    } else {
        const subscriber = await Subscription.create({
            subscriber: userId,
            channal: channalId,
        });
        if (!subscriber) {
            throw new ApiError(401, "unable to the subcribe");
        }
        res
            .status(201)
            .json(
                new ApiResponse(200, subscriber, "channal is subcrbed successfully")
            );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const { channalId  } = req.params;

    if (!channalId) {
        throw new ApiError(401, "cannot get channal Id")
    }

    const getAllSubcriberDetials = await Subscription.aggregate([
        {
            $match: {
                channal: new mongoose.Types.ObjectId(`${channalId}`)
            }
        },
         {
            $lookup: {
              from: "subscriptions",
              localField: "channel",
              foreignField: "subscriber",
              as: "subscribedChannels",
            },
          },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])

    if (!getAllSubcriberDetials) {
        throw new ApiError(401, "there si errir in get all the subciber details")
    }

    res.status(201)
        .json(
            new ApiResponse(200, getAllSubcriberDetials, "all subscriber data get successfully")
        )

});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channalId } = req.params;

    if (!channalId) {
        throw new ApiError(401, "cannot get the channal id");
    }

    const getSubscriber = await Subscription.aggregate([
        {
            $match: {
                channal: new mongoose.Types.ObjectId(`${channalId}`)
            }
        },
        {
            $group: {
                _id: "$channal",
                totalSubscribers: { $sum: 1 }
            }
        }
    ])
    console.log(getSubscriber);
    if (!getSubscriber) {
        throw new ApiError(401, "error on ")
    }

    res.status(201)
        .json(
            new ApiResponse(200, getSubscriber, "getChannalSubciber")
        )
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
