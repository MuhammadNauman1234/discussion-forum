const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userRegistration = require("../model/users")
const post = require("../model/posts");
const bodyParser = require('body-parser');


const JWT_SECRET = "mysecretkeythisisforalsdjfklasjfasdfjasdsdfweiofsdklfjasodusdfkljsdalf";


//****************************User Authentication*****************************//


const Authenticate = async (req,res,next)=>{
    try {
        const token = localStorage.getItem("mytoken");
        const verifytoken = jwt.verify(token, JWT_SECRET);

       await userRegistration.findOne({_id:verifytoken._id},(err,rootUser)=>{
            if(!rootUser){
                console.log("user not found");
            }
            req.token = token;
            req.rootUser = rootUser;
            req.userID = rootUser._id;

        next();

        });
    } catch (error) {
        console.log(error);
        res.status(401).json({error:"unauthorized"});
        console.log(error);
    }
}


//*****************************loged In userData**********************************/

const userData = async (req,res)=>{
    try{
        res.status(200).json({status:"ok",data:req.rootUser});
    } catch (error){
        console.log("user not found");
        res.status(500).json("error accure while Retrieving user Data.")
    }
    
}


const getAllUsers = async (req, res) => {
    try {
      const data = await userRegistration.find({});
      
      if (data) {
        return res.status(200).json({ data });
      } else {
        // If no data found, return a 404 Not Found response
        return res.status(404).json({ error: "No users found" });
      }
    } catch (error) {
      console.error("Error:", error);
      // Return a 500 Internal Server Error response for unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };



//********************Register new user***************************//

const userRegister = async (req, res) => {
    try {
      const { name, email, phone, category, password, confirmPassword } = req.body;
  
      // Check if the email already exists
      const existingUser = await userRegistration.findOne({ email });
  
      if (existingUser) {
        return res.status(404).json({ message: "Email already exists" });
      }
  
      // Check if the password and confirmPassword match
      if (password !== confirmPassword) {
        return res.status(404).json({ message: "Passwords do not match" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new userRegistration({
        name,
        email,
        phone,
        category,
        password: hashedPassword,
      });
  
      // Save the new user to the database
      await newUser.save();
  
      return res.status(200).json({ message: "Registration successful" });
    } catch (error) {
      console.error("Error:", error);
  
      // Handle specific Mongoose validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(404).json({ error: errors.join(", ") });
      }
  
      // Handle other unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };


//***************************userLogin****************************//


const userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await userRegistration.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "Email not found" });
      }
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: "Wrong password" });
      }
  
      // Generate a JWT token and update the user's token in the database
      const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET);
      await userRegistration.updateOne({ email: user.email }, { $set: { token } });
  
    //   // Set the token in the response headers (optional but recommended)
    //   res.header("Authorization", `Bearer ${token}`);
      localStorage.setItem('mytoken', token);
  
      // Return a successful response with the token
      return res.status(200).json({ status: "ok", token });
    } catch (error) {
      console.error("Error:", error);
  
      // Handle other unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

//******************************** sharePost **********************************//

const SharePost = async (req, res) => {
    try {
      const { user, title, text } = req.body;
  
      // Create a new post object
      const newPost = new post({
        auther: user.name,
        autherId: user._id,
        title,
        content: text,
      });
  
      // Save the new post to the database
      await newPost.save();
  
      return res.status(200).json({ message: "Post created successfully" });
    } catch (error) {
      console.error("Error:", error);
  
      // Handle specific Mongoose validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(404).json({ error: errors.join(", ") });
      }
  
      // Handle other unexpected errors
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

//******************************** getPosts **********************************//
// Get Posts
const getPosts = async (req, res) => {
    try {
      const result = await post.find().sort({ _id: -1 }).exec();
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Post Comments into Database
  const postComments = async (req, res) => {
    try {
      const { postId, autherId, auther, text } = req.body;
  
      const updatedPost = await post.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: [
              {
                autherId,
                auther,
                text,
              },
            ],
          },
        },
        { new: true }
      );
  
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.status(200).json({ message: 'Comment posted successfully', result: updatedPost });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Retrieve Comments from Database
  const getComments = async (req, res) => {
    try {
      const { id } = req.body;
  
      const result = await post.find({ _id: id }).sort({ _id: -1 }).exec();
      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Give Like to Post
const likes = async (req, res) => {
    try {
      const likeState = req.body.likeState;
      const postId = req.body.id;
  
      const update = { $inc: { likes: 1 } };
      if (!likeState) {
        // If likeState is false, decrement likes
        update.$inc.likes = 1;
      }
  
      const updatedPost = await post.updateOne({ _id: postId }, update);
  
      if (!updatedPost || updatedPost.nModified === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.status(200).json({ message: 'Like updated successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Get Individual User Posts
  const userPosts = async (req, res) => {
    try {
      const userId = req.params.id;
      const result = await post.find({ autherId: userId });
  
      res.status(200).json({ result });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Update Profile Picture
  const updateProfilePicture = async (req, res) => {
    try {
      const { userId, profilePicture } = req.body;
  
      const updateUser = await userRegistration.updateOne(
        { _id: userId },
        { $set: { profilePicture } }
      );
  
      if (!updateUser || updateUser.nModified === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const updatePosts = await post.updateMany(
        { autherId: userId },
        { $set: { profilePicture } }
      );
  
      res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  // Logout
  const Logout = (req, res) => {
    try {
      localStorage.removeItem('mytoken');
      res.send('Logout successfully');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


/**************************Exported modules***************************/

module.exports={
    getAllUsers,
    userRegister,
    userLogin,
    userData,
    Authenticate,
    Logout,
    SharePost,
    getPosts,
    postComments,
    getComments,
    likes,
    userPosts,
    updateProfilePicture
}



