const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// * ------- ENVIRONMENT VARIABLES -------
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


// * ------- BUILD MONGO URI -------
let mongoURI;

if (dbUsername && dbPassword) {
  mongoURI = `mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin`;
} else {
  mongoURI = `mongodb://${dbHost}:${dbPort}/${dbName}`;
}

// * ------- CONNECT DATABASE FUNCTION -------
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to database');
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
