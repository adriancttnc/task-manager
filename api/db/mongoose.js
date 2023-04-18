/* This file will handle connection logic to the MongoDB database. */

const mongoose = require('mongoose');
const config = require('../config');

mongoose.set('strictQuery', true);

mongoose.connect(`mongodb://${config.mongoDB.URL}:${config.mongoDB.port}/${config.mongoDB.database}`, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.log(`Not Connected to the Database ERROR! ${err}`);
  });

  module.exports = {
    mongoose
  };