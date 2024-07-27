import mongoose, { model, Schema } from "mongoose"
import JWT from "jsonwebtoken"
import bcrypt  from "bcrypt"

const UserSchema = new Schema({
    username: {
        type:String,
        require: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true

    },
    email:  {
        type:String,
        require: true,
        unique: true, 
        lowercase: true,
        trim: true,
    },
    password:  {
        type:String,
        require: true,
        trim: true,
        index: true

    },
    avatar:  {
        type:String,//cloudinary
        require:true,
    },
    FullName:{
        type:String,
        require:true,
        trim:true,
        index:true 
    },
 
    coverImage:  {
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshToken:{
        type:String
    }
})

UserSchema.pre('save',async function (next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
} )

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken  = function(){
    JWT.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.FullName

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
UserSchema.methods.generateRefreshToken  = function(){
    JWT.sign({
        _id:this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}



export const User = mongoose.model('User', UserSchema)