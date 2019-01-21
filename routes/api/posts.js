const express = require("express");
const router = express.Router();
const passport = require("passport");

//Post Model import
const Post = require("../../models/Posts");

//Profile Model
const Profile = require("../../models/Profile");

// input validation import
const validatPostInput = require("../../validations/post");

//@route GET api/posts/
//@desc Create a new posts
//access Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  //validation here
  const { errors, isValid } = validatPostInput(req.body);
  if (!isValid) {
    //return errors with status = 400
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

//@route GET api/posts/
//@desc Get all posts
//access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ data: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json(err));
});

//@route GET api/posts
//@desc Get post by id
//access Public
router.get("/:id", (req, res) => {
  Post.findById({ _id: req.params.id })
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ failed: "No post found with such id" }));
});

//@route Delete api/posts
//@desc Delete post by id
//access Private
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(() => {
    Post.findById(req.params.id).then(post => {
      //check if post exist
      if (!post) {
        return res.status(404).json({ msg: "No post found with such id" });
      }
      //check for post owner
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }

      //delete
      post
        .remove()
        .then(() => res.json({ success: true }))
        .catch(() => res.status(404).json({ msg: "Could not delet Post" }));
    });
  });
});

//@route POST api/posts/like/:id
//@desc like post by id
//access Private
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(() => {
    Post.findById(req.params.id).then(post => {
      if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({ msg: "User already like this post" });
      }

      //Add user id to likes array
      post.likes.unshift({ user: req.user.id });

      post
        .save()
        .then(post => res.json(post))
        .catch(() => res.send(400).json({ msg: "an error occured" }));
    });
  });
});

//@route POST api/posts/unlike/:id
//@desc unlike post by id
//access Private
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(() => {
    Post.findById(req.params.id).then(post => {
      if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json({ msg: "Unlike post err" });
      }

      //Get remove index
      const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

      //Splice out of array
      post.likes.splice(removeIndex, 1);

      //save
      post
        .save()
        .then(post => res.json(post))
        .catch(() => res.send(400).json({ msg: "an error occured" }));
    });
  });
});

//@route POST api/posts/comment/:id
//@desc Add comment to  post
//access Private
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  //validation here
  const { errors, isValid } = validatPostInput(req.body);
  if (!isValid) {
    //return errors with status = 400
    return res.status(400).json(errors);
  }
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };

      //Add to comments array
      post.comments.unshift(newComment);
      ///saving comment
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json(err));
});

//@route DELETE api/posts/comment/:id
//@desc Remove comment from  post
//access Private
router.delete("/comment/:id/:comment_id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Post.findById(req.params.id).then(post => {
    //Check to see if comment exists
    if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    //Get remove index
    const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

    //splicing comment out of array
    post.comments.splice(removeIndex, 1);
    post.save().then(post => res.json(post));
  });
});

module.exports = router;
