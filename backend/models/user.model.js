import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    userName:{
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String, //cloudinary url
        default: ""
    }
},{timestamps: true})

//this is a middleware that will run just before saving the password in DB
//the below code will encrypt the password
userSchema.pre("save",  async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

//we will add a function that will check will the password given by user match to that stored in DB
userSchema.methods.isPasswordCorrect = async function (password){
    //the bcrypt can hash the password also can compare the encoded password with password provided by the user
    return await bcrypt.compare(password,this.password);
}

export const User = mongoose.model("User",userSchema)