import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import authRoutes from './routes/authRoutes.js'
import listingRoutes from "./routes/listingRoutes.js";

dotenv.config();
connectDB();

const app = express()

app.use(express.json())
app.use(cors({origin: process.env.CLIENT_URL, credentials:true}))

app.get("/",(req, res)=>res.send("API is running"))

app.use("/api/auth",authRoutes)
app.use("/api/listings", listingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))