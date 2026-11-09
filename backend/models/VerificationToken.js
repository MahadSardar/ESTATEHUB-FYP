import mongoose from "mongoose"

const tokenSchema = new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},

        type:{type:String,enum:["verify","reset"],required:true},

        code:{type:String,required:true},

        expiresAt:{type:Date,required:true},


    },{timestamps:true}
)
const VerificationToken = mongoose.model("VerificationToken",tokenSchema)

export default VerificationToken