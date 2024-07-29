import mongoose,{Schema} from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.types.ObjectId,
        ref:"User",
    },
    channal:{
          type:Schema.Types.ObjectId,
          ref:"User"
    }
},{
    timestamps:true
}
)


export const subscription = mongoose.model('subscription',subscriptionSchema)