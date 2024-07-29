import mongoose, { Schema } from "mongoose";



const playlistSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true   
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"vedio"
        }
    ]
    ,
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
}
,{
    timestamps:true
})

export const PalyList = mongoose.model('Playlist',playlistSchema)