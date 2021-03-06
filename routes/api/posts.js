const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profile model
const Profile = require('../../models/Profile');

const Post = require('../../models/Post');

const validatePostInput = require('../../validation/post');
//@route GET api/posts/test
//@desc tests post routes
//@access public

router.get('/test', (req, res) => res.json({msg: "posts works"}));


//@route GET api/posts
//@desc GET post
//@access public

router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json({nopostsfound: 'No posts find'}))
});


//@route GET api/posts/:id
//@desc GET post/:id
//@access public

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(400).json({nopostfound: 'No post find'}))
});



//@route POST api/posts
//@desc Create post
//@access Private

router.post('/',passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validatePostInput(req.body);
  //validation

  if(!isValid){
    //if is not valid, return 400 with errors
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


//@route POST api/posts/likes/:id
//@desc like posts
//@access Private

router.post('/like/:id',passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({alreadyliked: 'User already liked this post'});
          }

          // add user id to likes array
          post.likes.unshift({user : req.user.id});

          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    });

});



//@route DELETE api/posts/unlikes/:id
//@desc dislike posts
//@access Private

router.post('/unlike/:id',passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({notliked: 'You have not yet likes this post'});
          }

          //Get remove index

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice out of arrray
          post.likes.splice(removeIndex , 1);

          //Save

          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    });

});





//@route DELETE api/posts/:ID
//@desc DELETE Post
//@access Private

router.delete('/:id',passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if(post.user.toString() !== req.user.id){
            return res.status(401).json({notauthorized: 'User not authorized'});
          }

          //DELETE
          post.remove().then(() => res.json({success: true}));
        })
        .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    });
});



//@route POST api/posts/comment/:id
//@desc add comment to post
//@access Private

router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
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

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);


//@route POST api/posts/likes/:id/:comment_id
//@desc remove comment from post
//@access Private



router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {


    Post.findById(req.params.id)
      .then(post => {
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
          return res.status(404).json({commentnotexists: 'comment does not exist'});
        }

        //Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice comment out of arrray
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);


module.exports = router;
