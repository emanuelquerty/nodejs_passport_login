const express = require("express");
const router = express.Router();
const bcryp = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/user");

//Login Page
router.get("/login", (req, res) => res.render("login"));

//Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check passwords length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least six characters" });
  }

  if (errors.length > 0) {
    // There is an issue
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        // User Exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        // Hash Password
        bcryp.genSalt(10, (error, salt) => {
          bcryp.hash(newUser.password, salt, (error, hash) => {
            if (error) throw error;

            // Set password to hashed password
            newUser.password = hash;

            newUser
              .save()
              .then(user => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch(error => console.log(error));
          });
        });
      }
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
