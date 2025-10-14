const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// * ------- ENVIRONMENT VARIABLES -------
const {
  DB_USERNAME: dbUsername,
  DB_PASSWORD: dbPassword,
  DB_HOST: dbHost,
  DB_PORT: dbPort,
  DB_NAME: dbName
} = process.env;

// * ------- BUILD MONGO URI -------
let mongoURI;

if (dbUsername && dbPassword) {
  mongoURI = `mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
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
