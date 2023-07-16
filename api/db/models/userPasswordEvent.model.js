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
    // This means that it will expire forgotPasswordKeyLifespan (in seconds) after the date in 'default' is reached.
    expires: config.registration.forgotPasswordKeyLifespan,
    default: () => util.addToNow(config.registration.forgotPasswordKeyLifespan)
  }
});

const UserPasswordEvent = mongoose.model('userPasswordEvents', UserPasswordEventSchema);

// Ensure the indexes are always updated as per the schema above. A must have for any changes done to TTLs.
UserPasswordEvent.syncIndexes();

module.exports = { UserPasswordEvent }