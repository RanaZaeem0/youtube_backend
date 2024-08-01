import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { string } from "zod";



const commentSchema  = new Schema(
    {
        content:{
            type:String,
            require:true
        },
        owner:{
            type:Schema.Types.ObjectId
            ,ref:"User"
        }
        ,
        video:{
          type:Schema.Types.ObjectId,
          ref:"Video"
        }

    },{
        timestamps:true
    }
)

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model('Comment',commentSchema)