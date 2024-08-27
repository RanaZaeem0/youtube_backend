import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const viewsSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    video:{
          type:Schema.Types.ObjectId,
          ref:"Video"
    }
},{
    timestamps:true
}
)

viewsSchema.plugin(mongooseAggregatePaginate)

export const views = mongoose.model('View',viewsSchema)