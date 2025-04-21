const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


// * ------- ENVIRONMENT VARIABLES -------
const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;


// * ------- CONNECT DATABASE FUNCTION -------
const connectDB = async () => {
    await mongoose.connect(`${mongoURI}/${dbName}`);
    console.log('Connected to database');
}

module.exports = connectDB;