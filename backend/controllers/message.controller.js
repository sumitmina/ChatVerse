import { asyncHandler } from "../utils/asynHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

const getUsersForSidebar = asyncHandler( async (req,res) => {
    try {
        const loggedInUserId = req.user._id
        
        // fetch all users
        const allUsers = await User.find()      

        // now from the users array we will fetch all the users apart from the loggedIn user
        const users = allUsers.filter((item) => {
            return item._id.toString() !== loggedInUserId.toString()
        })

        res.status(200).json(
            new ApiResponse(200,users,"")
        )
    } catch (error) {
        console.log("Error in getUsersForSidebar controller: ",error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

const getMessages = asyncHandler( async (req,res) => {
    try {
        const {id:userToChatId} = req.params
        const myId = req.user._id
        const messages = await Message.find({
            $or: [
                {senderId:myId , receiverId:userToChatId},
                {senderId:userToChatId, receiverId: myId}
            ]
        })
        res.status(200).json(
            new ApiResponse(200,messages,"")
        )
    } catch (error) {
        console.log("Error in getMessages controller: ",error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

const sendMessage = asyncHandler (async (req,res) => {
    try {
        const {text,image} = req.body
        const {id:userToChatId} = req.params
        const myId = req.user._id
        let cloudinaryUrl = ""
        if(image){
            const uploadResponse = await uploadOnCloudinary(image)
            cloudinaryUrl=uploadResponse.secure_url
        }
        // create a new db entry
        const newMessage = new Message({
            senderId: myId,
            receiverId: userToChatId,
            text,
            image: cloudinaryUrl
        })
    
        await newMessage.save()
    
        //real-time functionality
        const receiverSocketId = getReceiverSocketId(userToChatId)

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json(
            new ApiResponse(200,newMessage,"")
        )
    } catch (error) {
        console.log("Error in send message controller: ",error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

export{
    getUsersForSidebar,
    getMessages,
    sendMessage
}