/**
 * apiForgotPassword
 * Stores the logic for the process of resetting a user's password
 *   if it has been forgotten. Different from Change Password.
 * Runs non-authenticated.
 */

const router = require('express').Router();
const { User, UserPasswordEvent} =  require('../db/models');
const crypto = require('crypto');
const util = require('./shared/util');
const config = require('../config');
const emailService = require('./shared/emailService');

/**
 * POST /forgotPassword
 * Purpose: Check if email is registered, if it is, issue reset key.
 */
router.post('', (req, res) => {
  let email =  req.body.email;
  // Check whether an user is registered with that email address.
  User.findOne({
    email: email
  }).then((user) => {
      // If an user is found.
      if (user) {
        // Generate the forgot password key.
        const key = crypto.randomBytes(32).toString('hex');
        // Build the URL for the user.
        const userURL = util.getUrl(req) + '/forgotPassword?key=' + key;
        // Get the lifespan of the key.
        const keyLifespan = getForgotPasswordKeyLifespan();
        // Build the password event object.
        const passwordEvent = new UserPasswordEvent({
          _userId: user._id,
          event: 'FORGOT',
          key
        });
        // Save the passwordEvent Document.
        passwordEvent.save();

        // Build the emailObj.
        const emailObj = {
          to: user.email,
          subject: 'Forgot Password',
          htmlTemplate: 'forgotPassword',
          templateReplacements: {
            link: userURL,
            linkLifespan: keyLifespan
          }
        };

        // Send the email.
        emailService.send(emailObj);
      }
      // Regardless of the result above, we want to send a 200 OK out as we don't want to give away the presence of an email in the db.
      return res.send({status: 200, statusMessage: 'OK'});
    })
    .catch((err) => {
      console.log(err);
    });
});

/**
 * POST /forgotPassword/:key
 * Purpose: Validate the key and reset a user's password.
 */
router.post('/:key', (req, res) => {
  const key = req.params.key;
  UserPasswordEvent.findOne({
    key: key
  }).then((passwordEvent) => {
    // If no key has been found, return back a message.
    if (!passwordEvent) {
      return Promise.reject({ error: 'Forgot Password key invalid or expired.' })
    }
    // Check if the two passwords match.
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // If they do, proceed and update the user.
    if (password === confirmPassword) {
      // Find the user first.
      User.findOneAndUpdate({
        _id: passwordEvent._userId
      }).then((user) => {
        // If the user is found.
        if (user) {
          // Update the password.
          user.password = password;
          // Save the changes.
          user.save()
            .then((savedUser)=> {
              // If user has been saved successfully.
              if (savedUser) {
                // Delete the userPasswordEvent.
                UserPasswordEvent.findOneAndDelete({
                  key: key
                }).catch((err) => {
                  console.log(err)
                })
              // Something has gone wrong.
              } else {
                throw new Error('Forgot Password - user.save() - No savedUser!');
              }
            }).catch((err) => {
              console.error(err);
            });
          // Return 200 OK.
          return res.send({status: 200, statusMessage: 'OK'});
        // User not found.
        } else {
          return Promise.reject({ error: 'User not found!' })
        }
      }).catch((err) => {
        console.log(err);
      })
      // Passwords do not match, return.
    } else {
      return Promise.reject({ error: 'Passwords do not match!' })
    }
  }).catch((err) => {
    console.log('Issue verifying the validity of the forgot password key\n', err);
    return res.send(err);
  });
})


/************************************************************
 ***********************HELPER METHODS***********************
************************************************************/


/**
 * Function that returns the lifespan of the forgot password key in words based on the value in the config file.
 * @returns Lifespan of the key in words.
 */
function getForgotPasswordKeyLifespan() {
  const timeUnit = config.registration.forgotPasswordKeyLifespan.slice(-1);
  let keyLifespan = config.registration.forgotPasswordKeyLifespan.slice(0, -1);
  switch (timeUnit) {
    case 's':
      keyLifespan = keyLifespan.concat(' ', (keyLifespan > 1) ? 'seconds' : 'second');
      break;
    case 'm':
      keyLifespan = keyLifespan.concat(' ', (keyLifespan > 1) ? 'minutes' : 'minute');
      break;
    case 'h':
      keyLifespan = keyLifespan.concat(' ', (keyLifespan > 1) ? 'hours' : 'hour');
      break;
    case 'd':
      keyLifespan = keyLifespan.concat(' ', (keyLifespan > 1) ? 'days' : 'day');
      break;
  }
  return keyLifespan;
}

module.exports = router;