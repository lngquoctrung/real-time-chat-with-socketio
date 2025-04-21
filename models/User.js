const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
    },
    username: String,
    pass: String,
    refreshToken: String,
    googleId: String,
    socketId: {
        type: String,
        default: ''
    },
    status: String,
    onlineAt: {
        type: String,
        default: () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    },
    offlineAt: {
        type: String,
        default: () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    }
});

module.exports = mongoose.model('user', userSchema);