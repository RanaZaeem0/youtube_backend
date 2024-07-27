import multer from "multer";
import path from 'path'


const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null,path.join(__dirname, "../../public/temp"))
    },
    filename: function (req, res, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})