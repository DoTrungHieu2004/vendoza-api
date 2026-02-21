const mongoose = require('mongoose');
const chalk = require('chalk');
require('dotenv').config();

const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(chalk.green.bold(`MongoDB connected: ${conn.connection.host}`));

    // Listen to connection events
    mongoose.connection.on('error', (err) => {
      logger.error(chalk.red.bold(`MongoDB connection error: ${err}`));
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn(chalk.yellow.bold('MongoDB disconnected'));
    });
  } catch (error) {
    logger.error(chalk.red.bold(`Error connecting to MongoDB: ${error.message}`));
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
