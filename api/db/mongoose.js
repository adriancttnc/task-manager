/* This file will handle connection logic to the MongoDB database. */

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/TaskManager', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB succesfully');
  })
  .catch((err) => {
    console.log(`Not Connected to the Database ERROR! ${err}`);
  });

  module.exports = {
    mongoose
  };