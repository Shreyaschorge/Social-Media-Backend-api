const express = require('express');

const router = express.Router();

// @route   GET api/users/test
// @desc    Test User Route
// @access  Private
router.get('/test', (req, res) => res.json({ msg: 'Users test' }));

module.exports = router;
