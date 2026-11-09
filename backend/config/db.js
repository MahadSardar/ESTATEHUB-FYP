import dns from "dns";
import mongoose from "mongoose"

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("mongoDB connected")
    } catch (error) {
        console.log("DB error:",error.message)
        process.exit(1)
    }
}
export default connectDB;