const mongoose = require("mongoose");
const logger = require("@/app/logger");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      maxIdleTimeMS: 60000,
    });
    logger.info(`MongoDB Connected`);
  } catch (error) {
    logger.error(`Error ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
