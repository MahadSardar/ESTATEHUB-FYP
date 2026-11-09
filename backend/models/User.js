import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true,trim:true},
        
        email:{type:String,required:true,unique:true,lowercase:true,trim:true},

        phone:{type:String,required:true,unique:true,trim:true},

        passwordHash:{type:String,required:true},

        role:{type:String,enum:["user","admin"],default:"user"},

        avatarUrl:{type:String,default:""},
        
        bio:{type:String,default:""},

        isVerified:{type:Boolean,default:false},

        isBlocked:{type:Boolean,default:false},

        
    },
    {timestamps:true}
)
const User = mongoose.model("User",userSchema);
export default User;