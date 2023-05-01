/**
 * This file will hold the routing for the api endpoints.
 * Each endpoint should (ideally) have its own file for better readability.
 */

const router = require('express').Router();

router.use('/forgotPassword', require('./apiForgotPassword'));

module.exports = router;