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
    // This means that it will expire 0 seconds after the date in 'default' is reached.
    expires: 0,
    default: util.addToNow(config.registration.refreshTokenDelete)
  }
});


const Session = mongoose.model('Session', SessionSchema);

// Ensure the indexes are always updated as per the schema above. A must have for any changes done to TTLs.
Session.syncIndexes();

module.exports = {
  Session
}