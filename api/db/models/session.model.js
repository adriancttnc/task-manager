const config = require('../../config');
const mongoose = require('mongoose');
const util = require('../../srvControllers/shared/util');


const SessionSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Automatically delete the document when the amount of time passed into expires passes(+ max 60s).
  deleteOn: {
    type: Date,
    expires: config.registration.refreshTokenLifespan,
    default: util.addToNow(config.registration.refreshTokenDelete)
  }
});


const Session = mongoose.model('Session', SessionSchema);

module.exports = {
  Session
}