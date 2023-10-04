var express = require("express");
const Router = express.Router();
var routeControllar = require("../controller/controllers");
const auth = require("../middleware/authantication");

Router.get("/users", routeControllar.getAllUsers);
Router.get("/userData", routeControllar.Authenticate, routeControllar.userData);
Router.post("/signup", routeControllar.userRegister);
Router.post("/login", routeControllar.userLogin);
Router.post("/sharepost", routeControllar.SharePost);
Router.get("/logout", routeControllar.Logout);
Router.get("/getposts", routeControllar.getPosts);
Router.post("/postcomments", routeControllar.postComments);
Router.get("/getcomments", routeControllar.getComments);
Router.get(
  "/userposts/:id",
  routeControllar.Authenticate,
  routeControllar.userPosts
);
Router.post("/like", routeControllar.likes);
Router.post("/update_profilePicure", routeControllar.updateProfilePicture);

module.exports = Router;
