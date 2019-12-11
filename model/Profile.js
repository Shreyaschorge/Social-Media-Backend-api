const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  handle: {
    type: String,
    required: true,
    max: 40
  },
  profilePhoto: {
    data: Buffer,
    contentType: String
  },
  coverPhoto: {
    data: Buffer,
    contentType: String
  },
  username: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    },
    snapchat: {
      type: String
    }
  }
});

module.exports = mongoose.model('profile', ProfileSchema);
