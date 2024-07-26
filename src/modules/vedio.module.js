import mongoose, { Schema } from "mongoose";
 



const videoSchema = new Schema({
    vidoeFile: {
        type: String,
        require: true,
    },
    thumbnail: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    duration: {
        type: Number,
        require: true
    }
    ,
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: true
        , default: true,
    },
    owner: {
        tpye: Schema.Types.ObjectId,
        ref: 'User'
    }

},
{
    timestamps:true
}
)


export const Video = mongoose.model('Video', videoSchema)