import mongoose, { model, Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt  from "bcrypt"
import dotenv from "dotenv"

dotenv.config({
    path:"../../env"
})

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
    fullName:{
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
    const ss = await bcrypt.compare(password,this.password)
console.log(ss,'pass id correct');
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    



  
}
UserSchema.methods.generateRefreshToken  = function(){
  return  jwt.sign({
        _id:this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}



export const User = mongoose.model('User', UserSchema)