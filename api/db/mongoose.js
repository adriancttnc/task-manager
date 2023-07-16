/* This file will handle connection logic to the MongoDB database. */

const mongoose = require('mongoose');
const config = require('../config');

mongoose.set('strictQuery', true);

const connectionOptions = {
  useNewUrlParser: true
};

const db = mongoose.connection;

db.on('connecting', () => {
  console.log('  Connecting to MongoDB...')
});

db.on('connected', () => {
  console.log('  Connected to MongoDB successfully!')
});

db.once('open', function() {
  console.log('  MongoDB connection opened!');
});

db.on('disconnected', () => {
  console.log('====================================================================');
  console.log('Connection to MongoDB lost!')
  console.log('====================================================================');
});

db.on('reconnected', () => {
  console.log('====================================================================');
  console.log('Connection to MongoDB re-established successfully!');
  console.log('====================================================================');
});

db.on('error', (err) => {
  console.log(err);
});

const connectToDb = async () => {
  return await mongoose.connect(`mongodb://${config.mongoDB.URL}:${config.mongoDB.port}/${config.mongoDB.database}`, connectionOptions)
    .catch((err) => {
      console.log('====================================================================');
      console.log('Could not connect to MongoDB', err)
      console.log('====================================================================');
    });
};



module.exports = {
  mongoose,
  connectToDb
};