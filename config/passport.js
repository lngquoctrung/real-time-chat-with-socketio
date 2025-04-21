const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('../services/userService');
const { accessToken, refreshToken } = require('../config/jwt');
const bcryptjs = require('bcryptjs');

// // Decide which user's data will store into session
// passport.serializeUser((user, done) => {
//     console.log('1')
//     done(null, user.email);
// });

// // Get user's data from session and convert user object
// passport.deserializeUser(async (email, done) => {
//     try{
//         console.log('2')
//         const user = await UserService.get({ email: email });
//         done(null, user);
//     }
//     catch(error){
//         done(error, null);
//     }
// });

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    // Callback will call after Google authencated
    async (googleAccessToken, googleRefreshToken, profile, done) => {
        try{
            // Generate new refresh token when login
            const newAccessToken = accessToken.sign({ 
                email: profile.emails[0].value,
                username: profile.displayName,
            });
            const newRefreshToken = refreshToken.sign({ 
                email: profile.emails[0].value,
                username: profile.displayName,
            });
            // Check user whether existed in database or not
            let user = await UserService.get({ googleId: profile.id });
            // Hash password
            const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPTJS_SALT));
            const hashedPass = await bcryptjs.hash(process.env.GOOGLE_PASSWORD, salt);
            // Create new user and save into database
            if(!user){
                user = await UserService.create({
                    email: profile.emails[0].value,
                    username: profile.displayName,
                    pass: hashedPass,
                    refreshToken: newRefreshToken,
                    googleId: profile.id,
                    status: 'online'
                });
            }
            // Update refresh token when user login again
            if(user){
                await UserService.update({ email: user.email }, { refreshToken: newRefreshToken });
            }
            // Send data to next middleware
            return done(null, { user, newAccessToken, newRefreshToken });
        }
        catch(error){
            return done(error, null);
        }
    }
));