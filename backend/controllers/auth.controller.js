import { User } from "../models/user.model.js"
import {asyncHandler} from "../utils/asynHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {generateToken} from "../utils/generateToken.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const signup = asyncHandler ( async (req,res) => {
    try{
        const {fullName, userName, email, password} = req.body
        if(fullName === ""){
            res.status(400).json({
                success: false,
                message: "full name is required"
            })
        }
        if(userName === ""){
            res.status(400).json({
                success: false,
                message: "username is required"
            })
        }
        if(email === ""){
            res.status(400).json({
                success: false,
                message: "email is required"
            })
        }
        if(password === ""){
            res.status(400).json({
                success: false,
                message: "password is required"
            })
        }
        const user =  await User.findOne({
            $or: [{userName},{email}]
        });

        if(password.length < 6){
            res.status(400).json({
                success: false,
                message: "password must of atleast 6 characters"
            })
        }

        if(user){
            res.status(400).json({
                success: false,
                message: "Email or username already exist"
            })
        }

        const createdUser = await User.create({
            email,
            userName,
            fullName,
            password
        })

        if(createdUser){
            // generate token
            generateToken(createdUser._id,res);
            await createdUser.save();

            res.status(200).json(
                new ApiResponse(200, createdUser, "User registered successfully")
            )
        }else{
            throw new ApiError(500,"Something went wrong while registering the user")
        }
    }
    catch(err){
        throw new ApiError(500,err.message);
    }
})

const login = asyncHandler( async (req,res) => {
    try {
        // we will do email based login
        const {email, password} = req.body
        if(email===""){
            res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }
        if(password===""){
            res.status(400).json({
                success: false,
                message: "Password is required"
            })
        }
    
        // find the user
        const user = await User.findOne({email})
    
        if(!user){
            res.status(400).json({
                success: false,
                message: "User not found. Sign In required"
            })
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if(!isPasswordValid){
            res.status(400).json({
                success:false,
                message: "Incorrect Password"
            })
        }
    
        // generate token
        generateToken(user._id,res);
    
        res.status(200).json(
            new ApiResponse(200,user,"Login Successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

const logout = asyncHandler(async (req,res)=>{
    try {
        // just expire the token
        res.cookie("jwt","",{
            maxAge:0
        })
    
        res.status(200).json(
            new ApiResponse(200,"","Logout successfully")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

const updateProfile = asyncHandler(async (req,res)=>{
    try {
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            res.status(400).json({
                success: false,
                message: "Profile pic is required"
            })
        }

        // upload on cloudinary
        const imageUpload = await uploadOnCloudinary(profilePic)
        
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: imageUpload.secure_url}, {new:true})

        res.status(200).json(
            new ApiResponse(200,updatedUser,"Profile picture updated")
        )
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

const checkAuth = (req,res) => {
    try {
        res.status(200).json(
            new ApiResponse(200,req.user,"")
        )
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export {
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
}