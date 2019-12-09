const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
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
  }
});
