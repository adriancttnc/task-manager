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
  logging: {                          // Settings for logging Node.js outputs and errors.
    logErrorsToFile: true,            // If enabled, logs errors to file. Default true.
    logServerOutputToFile: true,      // If enabled, logs console.log() to file. Default true.
    errorLogFilePath: '',
    serverLogfilePath: ''
  },
  registration: {                           // Settings for the user registration.
    refreshTokenLifespan:       '10d',      // Time for how long the refreshToken lasts.
    refreshTokenDelete:         '30d',      // Time before the refreshToken is removed from db.
    accessTokenLifespan:        '15m',      // Time for how long the access token lasts.
    forgotPasswordKeyLifespan:  '15s',      // Time for how long the forgot password key lasts. String along with the unit for others ('60s', '15m', '1h', '2d')
    bcryptCostFactor:           12,         // Value that specifies the power of 2 for the number of iterations when hashing the password.
    minPasswordLength: 8
  }
}