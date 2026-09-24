const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema = new Schema({
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    role: { 
        type: String, 
        enum: ["student", "professional", "owner"], 
        default: "student" 
    },
    gender: { 
        type: String, 
        enum: ["male", "female", "other"],
        default: "other" 
    },
    organization: { type: String },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
    ],
});

userSchema.plugin(passportLocalMongoose);
module.exports= mongoose.model('User',userSchema);
