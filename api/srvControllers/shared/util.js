/**
 * File in which helper function and other utilities are stored.
 */


// Get and return the base of the URL.
const getUrl = (req) => {
  return `${req.protocol}://${req.get("host")}`;
};

/**
 * Add value from a passed-in string to the current time.
 * The string must be of format `'15s', '5m', '1.5h', '2d'`.
 * @param { string }amount
 * @returns current time plus the value in amount.
 */
const addToNow = (amount) => {
  // Get the time amount based on the letter in the string.
  let timeAmount;
  switch (amount.slice(-1))  {
    case 's':
      timeAmount = 1;
      break;
    case 'm':
      timeAmount = 60;
      break;
    case 'h':
      timeAmount = 60 * 60;
      break;
    case 'd':
      timeAmount = 24 * 60 * 60;
      break;
    default:
      timeAmount = 1;
  }
  // Get the amount of time out of the string.
  timeAmount = amount.slice(0, -1) * timeAmount * 1000;

  return (Date.now()) + timeAmount;
};

module.exports = {
  getUrl,
  addToNow
};