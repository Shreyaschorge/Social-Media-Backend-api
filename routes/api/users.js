const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');

const auth = require('../../middleware/auth');
const User = require('../../model/User');
const config = require('config');

// @route   GET api/users/test
// @desc    Test User Route
// @access  Private
router.get('/test', (req, res) => res.json({ msg: 'Users test' }));

// @route   POST api/users/register
// @desc    Register A User
// @access  Public

router.post(
  '/register',
  [
    check('name', 'Please Enter Name')
      .not()
      .isEmpty(),
    check('email', 'Please Include a Valid email').isEmail(),
    check(
      'password',
      'Please enter password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      //Check if there is a user present with input email
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const avatar = gravatar.url(email, {
        s: '200', //Size
        r: 'pg', // Rating
        d: 'mm' // Default
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          avatar: user.avatar,
          email: user.email
        }
      };

      jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   /api/user/login
// @desc    user login | return token
// @access  Public

router.post(
  '/login',
  [
    check('email', 'Please Enter a valid email').isEmail(),
    check('password', 'Please enter password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User doesn't exist" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          avatar: user.avatar,
          email: user.email
        }
      };

      jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
