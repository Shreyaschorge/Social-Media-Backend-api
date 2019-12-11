const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const router = express.Router();

//load Profile and User model
const Profile = require('../../model/Profile');
const User = require('../../model/User');

// @route   GET /api/profile/test
// @desc    Test Profile route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Profile test' }));

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  // ========================= Promise using .then ========================

  // const errors = {};

  // Profile.findOne({ user: req.user.id })
  //   .populate('user', ['name', 'avatar'])
  //   .then(profile => {
  //     if (!profile) {
  //       errors.noprofile = 'There is no profile for this user';
  //       return res.status(404).json(errors);
  //     }
  //     res.json(profile);
  //   })
  //   .catch(err => res.status(404).json(err));

  // ======================== async await ==================================

  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      res.status(404).json({ msg: 'There is no Profile for this User' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
  // ==================================================================
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public

router.get('/all', async (req, res) => {
  // ========================= .then() ==============================

  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));

  // ============================= Async await ============================

  // try {
  //   let profiles = Profile.find().populate('user', ['name', 'avatar']);
  //   if (!profiles) res.status(404).json({ msg: 'There are no Profile ' });

  //   res.json(profiles);
  // } catch (err) {
  //   console.error(err.message);
  //   res.status(500).json({ msg: 'Server Error' });
  // }
  // ======================================================================
  // error : Converting circular structure to JSON
  // ======================================================================
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', async (req, res) => {
  // ========================= .then() =================================
  // const errors = {};

  // Profile.findOne({ handle: req.params.handle })
  //   .populate('user', ['name', 'avatar'])
  //   .then(profile => {
  //     if (!profile) {
  //       errors.noprofile = 'There is no profile for this user';
  //       res.status(404).json(errors);
  //     }

  //     res.json(profile);
  //   })
  //   .catch(err => res.status(404).json(err));

  //=========================== Async await =============================

  try {
    let profile = await Profile.findOne({
      handle: req.params.handle
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      res.status(400).json({ msg: 'There is no profile of this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  // =======================================================================
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  // ============================ .then() ===============================
  // const errors = {};

  // Profile.findOne({ user: req.params.user_id })
  //   .populate('user', ['name', 'avatar'])
  //   .then(profile => {
  //     if (!profile) {
  //       errors.noprofile = 'There is no profile for this user';
  //       res.status(404).json(errors);
  //     }

  //     res.json(profile);
  //   })
  //   .catch(err =>
  //     res.status(404).json({ profile: 'There is no profile for this user' })
  //   );

  // // ======================== Async Await ================================

  try {
    let profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile)
      res.status(400).json({ msg: 'There is no profile of this user' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  // =======================================================================
});

// @route   POST /api/profile
// @desc    Create and Update User Profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      [
        check('handle', 'Enter the Handle')
          .not()
          .isEmpty()
          .isLength({ min: 2, max: 40 }),
        check('username', 'Enter the UserName')
          .not()
          .isEmpty(),
        check('bio', 'Enter the bio')
          .not()
          .isEmpty(),
        check('youtube', 'Not a valid link').isURL(),
        check('twitter', 'Not a Valid Link').isURL(),
        check('facebook', 'Not a Valid Link').isURL(),
        check('linkedin', 'Not a Valid Link').isURL(),
        check('instagram', 'Not a Valid Link').isURL(),
        check('snapchat', 'Not a Valid Link').isURL()
      ]
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.user;

    const profileFields = {};
    profileFields.user = req.user.id;

    const {
      handle,
      profilePhoto,
      coverPhoto,
      username,
      bio,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
      snapchat
    } = req.body;

    if (handle) profileFields.handle = handle;
    if (profilePhoto) profileFields.profilePhoto = profilePhoto;
    if (coverPhoto) profileFields.coverPhoto = coverPhoto;
    if (username) profileFields.username = username;
    if (bio) profileFields.bio = bio;

    //Social Links
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    if (snapchat) profileFields.social.snapchat = snapchat;

    // ========================== Promise using .then ==========================

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });

    // ==========================Async await not working=========================

    // try {
    //   let profile = await Profile.findOne({ user: id });

    //   if (profile) {
    //     // Update

    //     try {
    //       let profile = await Profile.findByIdAndUpdate(
    //         { user: req.user.id },
    //         { $set: profileFields },
    //         { new: true }
    //       );
    //       res.json(profile);
    //     } catch (err) {
    //       console.error(err.message);
    //     }
    //   } else {
    //     // Create

    //     // check if the handle exist
    //     try {
    //       let handle = await Profile.findOne({ handle: profileFields.handle });
    //       if (handle) {
    //         res.status(400).json({ msg: 'This handle already exists' });
    //       }

    //       let profile = new Profile(profileFields);
    //       await profile.save();
    //       res.json(profile);
    //     } catch (err) {
    //       console.error(err);
    //     }
    //   }
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).send('Server error');
    // }
    // ========================================================================
  }
);

// @route   POST /api/profile/profilePhoto/:userId
// @desc    add Profile photo
// @access  Private
router.post('/profilePhoto', auth, async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded'
      });
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        res.status(404).json({ msg: 'Profile dont exist' });
      }
      if (files.photo) {
        const newProf = {
          data: fs.readFileSync(files.photo.path),
          contentType: files.photo.type
        };
        // Add to profile Photo
        profile.profilePhoto.unshift(newProf);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', auth, (req, res) => {
  Profile.findOneAndRemove({ user: req.user.id }).then(() => {
    User.findOneAndRemove({ _id: req.user.id }).then(() =>
      res.json({ success: true })
    );
  });
});

module.exports = router;
