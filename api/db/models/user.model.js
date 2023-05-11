const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
// JWT Secret
// eslint-disable-next-line spellcheck/spell-checker
const jwtSecret = "51778657246321226641fsdklafjasdkljfsklfjd7148924065";
const config = require('../../config');
const util = require('../../srvControllers/shared/util');
const { Session } =  require('./session.model');
const { ERROR_MESSAGES } = require('../../srvControllers/shared/enums');


const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: config.registration.minPasswordLength
  }
});

/************************************************************
 ***********************INSTANCE METHODS*********************
************************************************************/

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // Return the document except the password and sessions (these shouldn't be made available).
  return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function () {
  const user = this;
  return new Promise((resolve, reject) => {
    // Create the JSON Web Token and return that.
    jwt.sign(
      { _id: user._id.toHexString() },
      jwtSecret,
      { expiresIn: config.registration.accessTokenLifespan },
      (err, token) => {
        if (!err) {
          // If there isn't an error.
          resolve(token);
        } else {
          // There is an error.
          reject(err);
        }
    });
  });
};

UserSchema.methods.generateRefreshAuthToken = function () {
  // This method simply generates a 64byte hex string. It doesn't save it to the database. saveSessionToDatabase() does that.
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buffer) => {
      if (!err) {
        // There isn't an error.
        let token = buffer.toString('hex');
        return resolve(token);
      } else {
        reject();
      }
    });
  });
};

UserSchema.methods.createSession = function () {
  let user = this;
  
  return user.generateRefreshAuthToken()
    .then((refreshToken) => {
      return saveSessionToDatabase(user, refreshToken);
    })
    .then((refreshToken) => {
      // Saved to database successfully. Now return the refresh token.
      return refreshToken;
    })
    .catch((err) => {
      return Promise.reject(ERROR_MESSAGES.SESSION_SAVE_FAIL, + err);
    });
};

/************************************************************
 ***********************MODEL METHODS************************
************************************************************/

UserSchema.statics.getJWTSecret = () => {
  return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function (_userId, token) {
  // Finds user by id and token. Used in auth middleware (verifySession).
  return Session.findOne({
    _userId: _userId,
    token: token
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let user = this;
  return user.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject();
      } else {
        return new Promise((resolve, reject) => {
          bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              resolve(user);
            } else {
              reject();
            }
          });
        });
      }
    });
};

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
  let secondsSinceEpoch = Date.now() / 1000;
  if (expiresAt > secondsSinceEpoch) {
    // Refresh token hasn't expired.
    return false;
  } else {
    // Refresh token has expired.
    return true;
  }
}

/************************************************************
 ***********************MIDDLEWARE***************************
************************************************************/

// Before a user document is saved, this code runs.
UserSchema.pre('save', function (next) {
  let user = this;
  let costFactor = config.registration.bcryptCostFactor;

  if (user.isModified('password')) {
    // If the password field has been edited/changed then run this code.
    // Generate the salt and hash the password.
    bcrypt.genSalt(costFactor, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

/************************************************************
 ***********************HELPER METHODS***********************
************************************************************/

let saveSessionToDatabase = (user, refreshToken) => {
  // Save session to database.
  return new Promise((resolve, reject) => {
    // let expiresAt = generateRefreshTokenExpiryTime();
    let expiresAt = util.addToNow(config.registration.refreshTokenLifespan);

    const userSession = new Session({
      _userId: user._id,
      token: refreshToken,
      expiresAt: expiresAt
    });

    userSession.save()
      .then(() => {
        return resolve(refreshToken);
      })
      .catch((err) => {
        reject(err);
      })
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };