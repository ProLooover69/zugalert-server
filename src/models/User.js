const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  label: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  savedRoutes: {
    type: [savedRouteSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
