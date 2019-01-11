const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//User Model import
const User = require("../../models/User");

// input validation import
const validateRegisterInput = require("../../validations/register");
const validateLoginInput = require("../../validations/login");

//Secret Key @Config
const secret = require("../../config/keys").secretKey;

//@router POST api/users/register
//@desc Register a user
//@access Public
router.post("/register", (req, res) => {
  //validating user input
  const { errors, isValid } = validateRegisterInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    }
    //Using gravartar
    const avatar = gravatar.url(req.body.email, { s: "200", r: "pg", d: "mm" });

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar
    });

    //generating hash password using bcrypt
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        //Saving new user to DB
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
});

//@router POST api/users/login
//@desc login a user / Return JWT Token
//@access Public
router.post("/login", (req, res) => {
  //validating user input
  const { errors, isValid } = validateLoginInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "Email Does Not exit" });
    }

    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //Creating JWT payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        //sign Token
        jwt.sign(payload, secret, { expiresIn: 3600 }, (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        return res.status(400).json({ password: "Email or password is incorrect" });
      }
    });
  });
});

//@router GET api/users/current
//@desc Return current user
//@access Public
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;
