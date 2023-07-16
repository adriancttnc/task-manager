const mongoose = require('mongoose');


const ErrorLogSchema = new mongoose.Schema({
  // When the error was thrown.
  dateTime: {
    type: Date,
    default: Date.now()
  },
  // File in which it was thrown,
  script: {
    type: String
  },
  // Whether it comes from frontend or backend.
  source: {
    type: String
  },
  // Place where the error was thrown (such as the function, class etc).
  location: {
    type: String
  },
  // Error code, if present with the error. Gives an indication outside the app of what happened. Also more user-friendly
  code: {
    type: Number
  },
  // Helpful short message.
  message: {
    type: String
  },
  // The actual error.
  details: {
    type: String
  }
});

const ErrorInstance = mongoose.model('ErrorLog', ErrorLogSchema);

module.exports = {
  ErrorInstance
}