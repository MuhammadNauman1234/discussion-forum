const mongoose=require('mongoose');
mongoose.connect("mongodb://localhost:27017/DiscussionForm",{useNewUrlParser:true});


//*********************** users Schema *************************//
const userSchema = new mongoose.Schema({

    name: String,
    profilePicture: {
        data: Buffer,
        contentType: String
    },
     email: {
    type: String,
    unique: true // `email` must be unique
    },
    phone: {
        type: String,
        unique: true
    },
    category:  String,
    password: String,
    token : String,

})

const userRegistration = mongoose.model("user",userSchema);
module.exports=userRegistration;
