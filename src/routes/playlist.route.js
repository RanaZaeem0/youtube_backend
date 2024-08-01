import express from "express"
import { Router } from "express"
import { createPlaylist,addVideoToPlaylist,
    removeVideoFromPlaylist,updatePlaylist,
    deletePlaylist, 
    getUserPlaylists,
    getPlaylistById} from "../controllers/playlist.controller.js"
import { verfiyJwt } from "../middleware/auth.middleware.js"


const router  = Router()

router.use(verfiyJwt)

router.route('/:playlistId')
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(updatePlaylist)

router.route('/createPlaylist')
.post(createPlaylist)
router.route('/:videoId/:playlistId')
.patch(removeVideoFromPlaylist)
router.route('/:videoId/:playlistId')
.post(addVideoToPlaylist)
router.route('/')
.get(verfiyJwt,getUserPlaylists)


export default router




