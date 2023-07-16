/* eslint-disable no-unused-vars */
/**
 * File that stores the logic for handling and logging errors.
 */
const { ERROR_CODES, ERROR_MESSAGES } = require('../shared/enums');
const { ErrorInstance } = require('../../db/models')
const fs = require('fs');
const config = require('../../config');



/**
 * Function to handle backend error in a more appropriate manner.
 * @param {*} error
 */
const handleBackendError = async (script, error, location = '') => {
  console.log('ERROR: ', error)
  const err = new ErrorInstance({
    script: script,
    source: 'BACKEND',
    code: error.errorCode,
    location: location,
    message: error.errorMessage,
    details: JSON.stringify(error)
  });

  await err.save()
    .then(() => {
      // Error saved successfully.
      console.log('Error saved successfully');
    })
    .catch((err) => {
      // Error was not saved successfully so we will just console log the error.
      console.error(err);
    });

}


module.exports = {
  handleBackendError
}