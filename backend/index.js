import express from 'express'
import dotenv from "dotenv"
import cors from "cors"
import {connectDB} from "./db/db.js"
import cookieParser from 'cookie-parser'

import {app, server} from "./utils/socket.js"

// app.use(express.json())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

dotenv.config({
    path: "./.env"
})

app.use(cors({
    origin: process.env.CORS_ORIGIN,  
    credentials: true
}))

connectDB()
.then(()=>{
    server.listen(process.env.PORT, ()=>{
        console.log(`⚙️ Server is running on port: ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log(err.message);
})



// testing the app
app.get('/',(req,res)=>{
    res.send("API working")
})

// auth routes
import authRoutes from "./routes/auth.route.js"
app.use("/api/auth",authRoutes)

// messsage routes
import messageRoutes from "./routes/message.route.js"
app.use("/api/message",messageRoutes)