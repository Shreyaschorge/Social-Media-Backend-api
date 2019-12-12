const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const auth = require('../../middleware/auth');

const Post = require('../../model/Post');
const Profile = require('../../model/Profile');

// @route   GET /api/posts/test
// @desc    Test Posts route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Post test' }));

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  // =================== Async Await =========================================
  try {
    let posts = await Post.find().sort({ date: -1 });
    if (!posts) {
      res.status(404).json({ msg: 'No Post Found' });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

  //======================= .then() ============================================

  //   Post.find()
  //     .sort({ date: -1 })
  //     .then(posts => res.json(posts))
  //     .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));

  //===========================================================================
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', async (req, res) => {
  //======================= Async await ========================================

  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: 'No Post found for this ID' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

  // ======================= .then() ==========================================

  //   Post.findById(req.params.id)
  //     .then(post => res.json(post))
  //     .catch(err =>
  //       res.status(404).json({ nopostfound: 'No post found with that ID' })
  //     );

  // ===========================================================================
});

// @route   Post /api/posts
// @desc    Create Post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check(
        'text',
        'Enter the post title (kindly mention event name along with it) and Content should be of more than 10 characters'
      )
        .not()
        .isEmpty()
        .isLength({ min: 10 }),
      check()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { text, photo, name, avatar, profilePhoto } = req.body;

    const newPost = new Post({
      text,
      photo,
      name,
      avatar,
      profilePhoto,
      user: req.user.id
    });

    await newPost.save();
    res.json(newPost);
  }
);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private

router.delete('/:id', auth, async (req, res) => {
  //   ===================== Async Await =================================
  //   try {
  //     let post = await Post.findById(req.params.id);
  //     if (!post) {
  //       res.status(404).json({ msg: 'No post found with this ID' });
  //     }
  //     if (post.user.toString() !== req.user.id) {
  //       res.status(401).json({ msg: 'User not Authorized' });
  //     }
  //     await post.remove();
  //     res.json({ success: true });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Server Error');
  //   }

  //   ========================== .then() ==========================================

  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: 'User not authorized' });
        }

        // Delete
        post.remove().then(() => res.json({ success: true }));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });

  //   ================================================================================
});

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  //   ========================== .then() ============================================

  //   Profile.findOne({ user: req.user.id }).then(profile => {
  //     Post.findById(req.params.id)
  //       .then(post => {
  //         if (
  //           post.likes.filter(like => like.user.toString() === req.user.id)
  //             .length > 0
  //         ) {
  //           return res
  //             .status(400)
  //             .json({ alreadyliked: 'User already liked this post' });
  //         }

  //         // Add user id to likes array
  //         post.likes.unshift({ user: req.user.id });

  //         post.save().then(post => res.json(post));
  //       })
  //       .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  //   });

  //   ================================Async await =================================

  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: 'No Post With this ID' });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res
        .status(400)
        .json({ alreadyliked: 'User already liked this post' });
    }
    await post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  //   ==============================================================================
});

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post('/unlike/:id', auth, async (req, res) => {
  // ========================== .then() =======================================

  //   Profile.findOne({ user: req.user.id }).then(profile => {
  //     Post.findById(req.params.id)
  //       .then(post => {
  //         if (
  //           post.likes.filter(like => like.user.toString() === req.user.id)
  //             .length === 0
  //         ) {
  //           return res
  //             .status(400)
  //             .json({ notliked: 'You have not yet liked this post' });
  //         }

  //         // Get remove index
  //         const removeIndex = post.likes
  //           .map(item => item.user.toString())
  //           .indexOf(req.user.id);

  //         // Splice out of array
  //         post.likes.splice(removeIndex, 1);

  //         // Save
  //         post.save().then(post => res.json(post));
  //       })
  //       .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  //   });

  // ============================== async await ======================================

  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: 'No Post Found' });
    }
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      res.status(400).json({ msg: 'You have not like this post yet' });
    }

    //Get remove index
    const removeIndex = post.likes
      .map(item => item.user.toString())
      .indexOf(req.user.id);

    //Splice out of array
    post.likes.splice(removeIndex, 1);

    //Save
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', auth, async (req, res) => {
  //  ========================== .then() ==================================

  //   Post.findById(req.params.id)
  //     .then(post => {
  //       const newComment = {
  //         text: req.body.text,
  //         name: req.body.name,
  //         avatar: req.body.avatar,
  //         user: req.user.id
  //       };

  //       // Add to comments array
  //       post.comments.unshift(newComment);

  //       // Save
  //       post.save().then(post => res.json(post));
  //     })
  //     .catch(err => res.status(404).json({ postnotfound: 'No post found' }));

  // ============================== Async Await =================================

  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ msg: 'No Post Found' });
    }
    const { text, name, avatar } = req.body;

    const newComment = {
      text,
      name,
      avatar,
      user: req.user.id
    };

    //Add to comments array
    await post.comments.unshift(newComment);

    //Save
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  // ============================= .then() =============================================

  //   Post.findById(req.params.id)
  //     .then(post => {
  //       // Check to see if comment exists
  //       if (
  //         post.comments.filter(
  //           comment => comment._id.toString() === req.params.comment_id
  //         ).length === 0
  //       ) {
  //         return res
  //           .status(404)
  //           .json({ commentnotexists: 'Comment does not exist' });
  //       }

  //       // Get remove index
  //       const removeIndex = post.comments
  //         .map(item => item._id.toString())
  //         .indexOf(req.params.comment_id);

  //       // Splice comment out of array
  //       post.comments.splice(removeIndex, 1);

  //       post.save().then(post => res.json(post));
  //     })
  //     .catch(err => res.status(404).json({ postnotfound: 'No post found' }));

  // ============================Async await ========================================

  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ msg: 'No post Found' });
    }
    if (
      post.comments.filter(
        comment => comment._id.toString() === req.params.comment_id
      ).length === 0
    ) {
      res.status(404).json({ msg: 'No Comments Found' });
    }

    // Get remove Index
    const removeIndex = post.comments
      .map(item => item._id.toString())
      .indexOf(req.params.comment_id);

    // Splice comment out of array
    post.comments.splice(removeIndex, 1);

    // Save
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
  // ================================================================================
});

module.exports = router;
