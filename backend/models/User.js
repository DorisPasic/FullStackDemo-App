import mongoose, { model} from 'mongoose';

const { Schema } = mongoose

// address Schema 
const addressSchema = new Schema({
    street : String, 
    zip : String,
    city: String,
    country : String
},{_id: false})


// user Schema 

const userSchema = new Schema({
    userNumber : Number,
    name:{
        type:String,
        required: true,
       
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type : String,
        required: true
    },
    profileImage:{
        type : String,
        default : "https://images.pexels.com/photos/2011173/pexels-photo-2011173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    isVerified: {
        type: Boolean,
        required : true,
        default : false
    },
    roles : {
        type:[String],
        required : true,
        default :["user"]
    },
    address : [addressSchema] // multiple addresses
},{timestamps : true});

const User = model('User', userSchema);

export default User