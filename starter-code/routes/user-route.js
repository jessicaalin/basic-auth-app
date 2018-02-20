const express = require("express");
const userRoute = express.Router();

// require user model
const User = require("../models/user-model");

const bcrypt = require("bcrypt");
const bcryptSalt = 10;


// signup page
userRoute.get("/signup", (req, res, next) => {
  res.render("user-views/signup");
});

// actual signup
userRoute.post("/signup", (req, res, next) => {

  // creating varaibles for the parsed info from our form
  // req.body is from body parser
  // username is the name in the form
  var username = req.body.username;
  var userpass = req.body.password;

  // creating validation if someone writes an empty string
  if (username === "" || userpass === "") {
    // render the signup page with an errorMessage
    // errorMessage will be used in ejs
    res.render("user-views/signup", { errorMessage: "Indicate a username and a password to sign up" });
    return;
  }

  // calling on the User defined earlier which gives us access to the database
  // trying to search the database with the username
  // passing through err for errors
  // passing through user for the results
  User.findOne({ username }, "username", (err, userResult) => {
    // of the username is not null/not undefined/DOES exist
    if (userResult !== null) {
      res.render("user-views/signup", { errorMessage: "The username already exists" });
      return;
    }

    // only creating the hash once we're going to save 
    // because why create unless it passes validation
    var salt     = bcrypt.genSaltSync(bcryptSalt);
    var password = bcrypt.hashSync(userpass, salt);

    // create a new user
    var newUser  = User({
      // pass the variables we just created above
      username,
      password
    });

    // save the user
    newUser.save((err) => {
      // redirect to URL login
      res.redirect("/login");
    });
  });
});


// login page
userRoute.get("/login", (req, res, next) => {
  res.render("user-views/login");
});

// actual login
userRoute.post("/login", (req, res, next) => {

  // creating variables for data pulled from inputs
  // req.body is from body parser
  // username is the name in the form
  var username = req.body.username;
  console.log(username);
  var userpass = req.body.password;
  console.log(userpass);

  // checking if there are empty strings
  if (username === "" || userpass === "") {
    // if there are empty strings, render the page again
    // but with the errorMessage
    res.render("user-views/login", {errorMessage: "Missing username and/or password to signup :P"});
    return;
  }

  // using Model to search with the username
  User.findOne({username}, "_id username pasword", (err, user) => {
    // if there is an error or no user
    if (err || !user) {
      // render login with an errorMessage
      res.render("user-views/login", { errorMessage: "The username doesn't exist"});
    } else {
      // checking to see if the password matches
      if (bcrypt.compareSync(userpass, user.password)) {
        // creating a variable of the current user for our ejs
        req.session.currentUser = user;
        // upon success, redirect to /
        res.redirect("/");
      } else {
        // upon failure to check, redirect to login with errorMessage
        // errorMessage will be used in the ejs
        res.render("user-views/login", {errorMessage: 
        "Incorrect password"});
      }
    }
  });
});

userRoute.get("/logout", (req, res, next) => {
  // if already logged out
  if (!req.session.currentUser) {
    // then redirect to login
    res.redirect("login");
  }
  // if not logged out, then destroy the session AND
  req.session.destroy((err) => {
    // handle errors
    if (err) {
      console.log(err);
    }
    // AND redirect to login
    else {
      res.redirect("/login");
    }
  });
});



module.exports = userRoute;