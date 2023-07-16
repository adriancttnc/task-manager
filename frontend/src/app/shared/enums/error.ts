export enum ERROR_CODES {
  USER_NOT_FOUND = 10001,
  SESSION_NOT_FOUND = 10002,
  REFRESH_TOKEN_EXPIRED = 10003,
  ACCESS_TOKEN_EXPIRED = 10004,
  INVALID_OBJECTID = 10005,
  SESSION_SAVE_FAIL = 10006,
  FORGOT_PWD_KEY_INVALID_OR_EXPIRED = 10007,
  FORGOT_PWD_USER_SAVE_FAIL = 10008,
  PASSWORD_MISMATCH = 10009,
  // MongoDB
  MONGODB_NOT_CONNECTED = 18000,
  CONFIG_MISMATCH = 90001
}

/**
 * A frozen object with error levels that acts as an enum.
 * Depending on the level, the front end will act accordingly.
 * * ZERO - Do nothing.
 * * WARNING - Warn the user, but don't terminate session.
 * * CRITICAL - Terminate session and warn user.
 */
export const ERROR_LEVELS = Object.freeze({
  ZERO: 0,
  WARNING: 1,
  CRITICAL: 2
})