import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asynHandler.js"


const protectRoute = asyncHandler( async (req,res,next) => {
    try {
        const token = req.cookies.jwt

        if(!token){
            res.status(401).json({
                success:false,
                message: "No token is provided"
            })
        }

        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

        if(!decodedToken){
            res.status(401).json({
                message: "Unauthorized - Invalid Token"
            })
        }

        const user = await User.findById(decodedToken.userId).select("-password")

        if(!user){
            res.status(404).json({
                message: "User not found"
            })
        }

        req.user = user

        next()
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

export {
    protectRoute
}