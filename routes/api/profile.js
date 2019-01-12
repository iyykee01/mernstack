const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Profile Model import
const Profile = require("../../models/Profile");

//User Model import
const User = require("../../models/User");

// input validation import
const validatProfileInput = require("../../validations/profile");

//@route GET api/profile/
//@desc Get current user profile
//access Private
router.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There's no profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

//@route GET api/profile/handle/:handle
//@desc GET profile by handle
//access public
router.get("/handle/:handle", (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There's no profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ handleError: "No users found with such handle" });
    });
});

//@route GET api/profile/user/:user_id
//@desc GET profile by user id
//access public
router.get("/user/:user_id", (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There's no profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ idError: "No users found with such id" });
    });
});

//@route GET api/profile/all
//@desc GET all profile
//access public
router.get("/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There's no profile";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json({ idError: "No Profiles " });
    });
});

//@route Post api/profile/
//@desc Create or Edit user profile
//access Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  //validation here
  const { errors, isValid } = validatProfileInput(req.body);
  if (!isValid) {
    //return errors with status = 400
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.biod) profileFields.biod = req.body.biod;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  //skills - Split into array
  if (typeof (req.body.skills !== undefined)) {
    profileFields.skills = req.body.skills.split(",");
  }

  //socials
  profileFields.socials = {};
  if (req.body.youtube) profileFields.socials.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.socials.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.socials.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.socials.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.socials.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      //Update profile
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
        .then(profile => res.json(profile))
        .catch(err => res.json(err));
    } else {
      //Create new Profile

      //check if handle exists
      Profile.findOne({ handle: profileFields.hanlde }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exits";
          return res.status(400).json(errors);
        }

        //save new Profile
        new Profile(profileFields)
          .save()
          .then(profile => {
            return res.josn(profile);
          })
          .catch(err => {
            errors.saveProfile = "No profile could be save " + err;
          });
      });
    }
  });
});

module.exports = router;
