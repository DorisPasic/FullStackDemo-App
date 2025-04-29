import express from "express";
import connect from "./libs/db.js";
import User from "./models/User.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import bcrypt from 'bcryptjs';



const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(helmet({}));
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your allowed origin
  methods: 'GET, POST, PUT, DELETE',       // Allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization', // Allowed headers
  credentials: true // Allow cookies
}));

connect();

app.get("/", (req, res) => {
  res.send("Hello World");
});

// create a user
app.post("/user/new", async (req, res,next) => {
  try {
    const {name, email,password } = req.body;
    if (!email) {
      return res.json({ msg: "email is missing" });
    }
    const emailexist = await User.find({ email: req.body.email });
    console.log(emailexist);

    if (emailexist.length > 0) {
      return res.status(500).json({ msg: "Email exist! please add another email!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({name,email,password:hashedPassword});
    res.json({ msg: "user created ", newUser });
  } catch (error) {
    // console.log(error);
    // res.json({ msg: "Server Error" });
    next(error);
  }
});

app.post('/user/login', async(req,res,next)=>{
  try {
    const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({email});
  if(!user){
    return res.status(404).json({msg :"invalid credential - email not found"})
  }
  const match = await bcrypt.compare(password,user.password)
  if(!match){
    return res.status(400).json({msg :"invalid password"})
  }
  
    /// create token
    const payload = {
      id : user._id,
      email : user.email
    }
    const token = jwt.sign(payload,process.env.SECRET_JWT)
    console.log('Token wurde erstellt',token );
    //res.json(token)
    res.cookie('token', token ,{
      httpOnly : true,
      sameSite : 'Lax',
      secure : true,
      maxAge : 1000 * 60 * 60, // 1 hour
    } )
    return res.json({msg : "login successful" , user: payload})
  
  } catch (error) {
    next(error)
  }
})

app.get('/user/dashboard', async(req,res,next)=>{
  // token from cookie 
  const token = req.cookies.token;
  console.log('Cookies:', req.cookies);

  if(!token){
    return res.status(401).json({msg :"unauthorized"})
  }
  const payload = jwt.verify(token, process.env.SECRET_JWT)
  if(!payload){
    return res.json({msg :"invalid token!!"})
  }
  const user = await User.findById(payload.id)
  if(!user){
    return res.status(404).json({msg :"user not found"})
  }
  res.json({msg :"welcome to your dashboard", user})
})

app.get('/user/logout' , async(req,res,next)=>{
  res.clearCookie('token', {})
  res.json({ msg : 'logged out successfully!!'})
})

app.get('/verify/:token' , (req,res,next)=>{
  const token = req.params.token;
  try {
    const payload = jwt.verify(token, process.env.SECRET_JWT )
    console.log(payload);
    
    if(!payload){
      return res.json({msg :"invalid token!!"})
    }
    return res.json({msg : "Sucessful!"})
  } catch (error) {
    next(error)
  }

})

app.get('/user/verify', (req, res, next) => {
  // Retrieve the token from the HTTP-only cookie
  const token = req.cookies.token;
 // console.log('token verify: ',token);
  

  try {
    if (!token) {
      return res.status(401).json({ msg: 'No token provided!' });
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.SECRET_JWT);
    console.log(payload);

    if (!payload) {
      return res.status(401).json({ msg: 'Invalid token!' });
    }

    return res.json({ msg: 'Successful!', user: payload });
  } catch (error) {
    next(error);
  }
});

// get all users
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json({ msg: `we have ${users.length} user`, users });
});

// delete single user

app.delete("/user/:id", async (req, res,next) => {
  // http://localhost:3000/user/67c5854195b2f24ce9c0b407
  try {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
      throw new Error('Invalid id')
    }
    const result = await User.deleteOne({ _id: id });
    if(result.acknowledged === true && result.deletedCount === 0){
       return res.json({msg : "deleted already or not found"})
    }
    res.json({ msg: "User deleted successfully", result });
  } catch (error) {
    // console.log(error);
    // res.json({ msg: "server error" });
    next(error)
  }
});


app.use((err,req,res,next)=>{
  console.error('Error found',err)
  //res.status(500).json({msg : "Internal Server Error"})
  res.sendStatus(500)
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});