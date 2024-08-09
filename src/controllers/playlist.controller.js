import mongoose, { isValidObjectId } from "mongoose"
import {Playlist}  from "../modules/playlist.module.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import zod from "zod"

const createPlaylist = asyncHandler(async (req, res) => {
    const playlistSchema = zod.object({
        name: zod.string(),
    })
    const valiedplaylist = playlistSchema.safeParse(req.body)

    const userId = req.user?.id


    if (!valiedplaylist.success) {
        throw new ApiError(401, "name or  is not valid")
    } else if (!userId) {
        throw new ApiError(400, "can not get User Id")
    }
    const { name, description } = valiedplaylist.data

    const playlist = Playlist.create(
        {
            name: name,
            owner: userId,

        }
    )

    if (!playlist) {
        throw new ApiError(401, "Unable to craete Playlist")
    }

    res.status(201).json(
        new ApiResponse(200, playlist, "playlist is Create succescfully")
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(402, "error cannot get id")
    }

    const getPalyList  = await Playlist.find({
        owner:userId
    })
    if (!getPalyList) {
        throw new ApiError(402, "error cannot get playlist with this id")
    }

    res.status(201)
    .json(
        new ApiResponse(200,getPalyList,"This the playlists with this user Id")
) 

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(401,"unable to the playlist id")
    }
    const getPalyList = await Playlist.findById(playlistId)
    if(!getPalyList){
        throw new ApiError(401,"There is no playlist this Playlist Id")
    }
    res.status(201)
    .json(
        new ApiResponse(200,
            getPalyList,
            "Successfully get the playlist"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if(!(playlistId || videoId)){
        new ApiError(401,"Unable to get Playlist or VideoId")
    }


    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $addToSet: {
            videos: videoId,
          },
        },
        {
          new: true,
        }
    )


    if(!addVideoToPlaylist){
        throw new ApiError(401,"DB Unable to add video in the playlist")
    }
   
    res.status(201).json(
        new ApiResponse(200,addVideoToPlaylist,"video add successFully")
    )


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
   // TODO: remove video from playlist
   if(!(playlistId || videoId)){
    new ApiError(401,"Unable to get Playlist or VideoId")
}


const deleteVideoToPlaylist = await Playlist.findByIdAndDelete(
    
        playlistId
    ,{
        $unset:{
            video:1
        }
    },{
        new:true
    }
)


if(!deleteVideoToPlaylist){
    throw new ApiError(401,"DB Unable to dele video in the playlist")
}

res.status(201).json(
    new ApiResponse(200,deleteVideoToPlaylist,"video deleted successFully")
)

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(401,"Unable to get the playlist id")
    }

    const deleteplaylist  = await Playlist.findByIdAndDelete(playlistId)

    if(!deleteplaylist){
        throw new ApiError(401,"Unable to delete the playlist ")
    }

    res.status(201)
    .json(
        new ApiResponse(201,deleteplaylist,"playlist delted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    
    const valiedplaylistUpdate = zod.object({
        name:zod.string().min(2),
        content:zod.string().min(2)

    })
    const validatePlaylistData = valiedplaylistUpdate.safeParse(req.body) 
    if(!validatePlaylistData.success){
        throw new ApiError(401,"User data is not valide minnimum 2 cataret")
    }
    
    const { name, content } = validatePlaylistData.data



    //TODO: update playlist
 
    if(!(playlistId)){
        throw new ApiError(401,"cant get the playlist Id")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
    
            playlistId,
               {
            $set:{
                name:name,
                content
            }
        }
    )

    if(!updatePlaylist){
        throw new ApiError(401,"Unable to update the playlist data")
    }
  res.status(201)
  .json(
    new ApiResponse(200,updatePlaylist,"playlist update successfully")
  )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
