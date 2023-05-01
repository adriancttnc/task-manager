/* eslint-disable spellcheck/spell-checker */
/**
 * File in which configuration settings are placed for the task-manager app.
 */

module.exports = {
  smtp: {                             // Authentication details for the email server.
    username:    '',
    displayName: '',
    password:    '',
    server:      '',
    service:     '',
    port:        '',
    ssl:         ''
  },
  oAuth2: {
    enabled:      '',
    clientId:     '',
    accessToken:  '',
    refreshToken: ''
  },
  email: {                            // Settings that apply when sending emails.
    receiverOverwrite: ''             // Sends all emails to this email if populated. (for testing)
  },
  mongoDB: {                          // Authentication details for mongoDB.
    database: 'TaskManager',
    URL:      '127.0.0.1',
    port:     '27017',
    username: '',
    password: ''
  },
  registration: {                           // Settings for the user registration.
    refreshTokenLifespan:       10,         // Days for how long the refreshToken lasts.
    accessTokenLifespan:        15,         // Minutes for how long the access token lasts.
    forgotPasswordKeyLifespan:  '15s',      // Time for how long the forgot password key lasts. String along with the unit for others ('60s', '15m', '1h', '2d')
    bcryptCostFactor:           12,         // Value that specifies the power of 2 for the number of iterations when hashing the password.
    minPasswordLength: 8
  }
}