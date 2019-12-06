const express = require('express');

const router = express.Router();

// @route   GET /api/posts/test
// @desc    Test Posts route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Post test' }));

module.exports = router;
