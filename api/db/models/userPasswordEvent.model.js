const mongoose = require('mongoose');
const config = require('../../config');
const util = require('../../srvControllers/shared/util');

const UserPasswordEventSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  key: {
    type: String, // SIGNUP/RESET/FORGOT
    required: true,
    unique: true
  },
  // Automatically delete the document when the amount of time passed into expires passes(+ max 60s).
  expiresAt: {
    type: Date,
    expires: config.registration.forgotPasswordKeyLifespan,
    default: () => util.addToNow(config.registration.forgotPasswordKeyLifespan)
  }
});

const UserPasswordEvent = mongoose.model('userPasswordEvents', UserPasswordEventSchema);

module.exports = { UserPasswordEvent }