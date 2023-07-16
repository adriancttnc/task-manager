/**
 * This file will host a list of numerous enums that can be used throughout the app.
 * Either selectively import what you need or import the whole file (though as it grows bigger, this would be unwise).
 */



/**
 * A frozen object with error codes that acts as an enum.
 * Still need to add some logic behind the numbers.
 * Numbers might change, which is why using the enum is highly recommended.
 */
const ERROR_CODES = Object.freeze({
  USER_NOT_FOUND: 10001,
  SESSION_NOT_FOUND: 10002,
  REFRESH_TOKEN_EXPIRED: 10003,
  ACCESS_TOKEN_EXPIRED: 10004,
  INVALID_OBJECTID: 10005,
  SESSION_SAVE_FAIL: 10006,
  FORGOT_PWD_KEY_INVALID_OR_EXPIRED: 10007,
  FORGOT_PWD_USER_SAVE_FAIL: 10008,
  PASSWORD_MISMATCH: 10009,
  // MongoDB
  MONGODB_NOT_CONNECTED: 18000,
  CONFIG_MISMATCH: 90001
});

/**
 * A frozen object with error levels that acts as an enum.
 * Depending on the level, the front end will act accordingly.
 * * ZERO - Do nothing.
 * * WARNING - Warn the user, but don't terminate session.
 * * CRITICAL - Terminate session and warn user.
 */
const ERROR_LEVELS = Object.freeze({
  ZERO: 0,
  WARNING: 1,
  CRITICAL: 2
})

/**
 * A frozen object with error messages that acts as an enum.
 * Messages might change, which is why using the enum is highly recommended.
 */
const ERROR_MESSAGES = Object.freeze({
  USER_NOT_FOUND: 'User not found. Make sure that the user id is correct.',
  SESSION_NOT_FOUND: 'Session not found. Make sure that the refresh token is valid.',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired.',
  ACCESS_TOKEN_EXPIRED: 'Access token has expired.',
  SESSION_SAVE_FAIL: 'Failed to save session to database.\n',
  NOT_FOUND: 'Session not found.',
  INVALID_OBJECTID: 'ObjectId provided is invalid.',
  FORGOT_PWD_KEY_INVALID_OR_EXPIRED: 'Forgot Password key invalid or expired.',
  FORGOT_PWD_USER_SAVE_FAIL: 'Forgot Password - user.save() - No savedUser!',
  PASSWORD_MISMATCH: 'Passwords do not match!',
  // MongoDB
  MONGODB_NOT_CONNECTED: 'Not connected to MongoDB. Cannot process request.',
  CONFIG_MISMATCH: 'Config files do not match!'
});

/**
 * A frozen object with HTTP response status codes that acts as an enum.
 * @Informational_responses (100 – 199)
 * @Successful_responses (200 – 299)
 * @Redirection_messages  (300 – 399)
 * @Client_error_responses 400 – 499)
 * @Server_error_responses (500 – 599)
 */
const STATUS_CODES = Object.freeze({
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  LOGIN_TIMEOUT: 440,
  INTERNAL_SERVER_ERROR: 500
})

/**
 * A frozen object with HTTP response status messages that acts as an enum.
 * Messages might change, which is why using the enum is highly recommended.
 */
const STATUS_MESSAGES = Object.freeze({
  OK: 'OK'
});



module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  STATUS_CODES,
  STATUS_MESSAGES,
  ERROR_LEVELS
}