const User = require('../models/User');

class UserService {
    // Add user
    static create = async (user) => {
        try{
            const newUser = new User(user);
            await newUser.save();
            return newUser;
        }
        catch(error){
            throw error;
        }
    }

    // Get user
    static get = async (filter) => {
        try{
            const user = await User.findOne(filter);
            if(user) return user;
            return;
        }
        catch(error){
            throw error;
        }
    }

    // Get user protected
    static protectedGet = async (filter) => {
        try{
            const user = await User.findOne(filter).select('-pass -refreshToken -googleId -__v');
            if(user) return user;
            return;
        }
        catch(error){
            throw error;
        }
    }

    // Update user
    static update = async (filter, update) => {
        try{
            const updatedUser = await User.findOneAndUpdate(filter, update, { new: true })
                                    .select('-_id -pass -refreshToken -googleId -__v');
            if(updatedUser) return updatedUser;
            return;
        }
        catch(error){
            throw error;
        }
    }

    // Delete user
    static delete = async (filter) => {
        try{
            const deletedUser = await User.findOneAndUpdate(filter);
            if(deletedUser) return deletedUser;
            return;
        }
        catch(error){
            throw error;
        }
    }
}

module.exports = UserService;