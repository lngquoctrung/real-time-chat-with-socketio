const UserService = require('../services/userService');
const cookieConfig = require('../config/cookieConfig');
const bcryptjs = require('bcryptjs');
const { accessToken, refreshToken } = require('../config/jwt');

// * ------- LOGIN -------
const login = async (req, res) => {
    // Check user whether existed or not
    let user = await UserService.get({ email: req.body.email });
    let newAccessToken, newRefreshToken;
    if(!user){
        req.flash('errorMsg', 'Account does not exist');
        req.flash('formData', req.body);
        return res.redirect('/login');
    }
    // Check password
    const isMatched = await bcryptjs.compare(req.body.pass, user.pass);
    if(!isMatched){
        req.flash('errorMsg', 'Account does not exist');
        req.flash('formData', req.body);
        return res.redirect('/login');
    }
    // Session
    if(!req.body.remember){
        req.session.user = {
            email: user.email,
            username: user.username,
        }
    }
    // JWT
    else{
        newAccessToken = accessToken.sign({
            email: user.email,
            username: user.username,
        });
        newRefreshToken = refreshToken.sign({
            email: user.email,
            username: user.username,
        });
        res.cookie('accessToken', newAccessToken, cookieConfig.accessToken);
        res.cookie('refreshToken', newRefreshToken, cookieConfig.refreshToken);

        // Save new refresh token in database
        await UserService.update({ email: user.email }, { refreshToken: newRefreshToken });
    }
    req.flash('user', {
        email: user.email,
        username: user.username,
    });
    return res.redirect('/');
}


// * ------- REGISTER -------
const register = async (req, res) => {
    // Check user whether existed or not
    let user = await UserService.get({ email: req.body.email });
    let newAccessToken, newRefreshToken;
    if(user){
        req.flash('errorMsg', 'Account existed');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    // Session
    if(!req.body.remember){
        req.session.user = {
            email: req.body.email,
            username: req.body.username
        }
    }
    // JWT
    else{
        newAccessToken = accessToken.sign({
            email: req.body.email,
            username: req.body.username,
        });
        newRefreshToken = refreshToken.sign({
            email: req.body.email,
            username: req.body.username,
        });
        res.cookie('accessToken', newAccessToken, cookieConfig.accessToken);
        res.cookie('refreshToken', newRefreshToken, cookieConfig.refreshToken);
    }
    // Hash password
    const salt = await bcryptjs.genSalt(parseInt(process.env.BCRYPTJS_SALT));
    const hashedPass = await bcryptjs.hash(req.body.pass, salt);

    // Save data to database
    const newUser = await UserService.create({
        email: req.body.email,
        username: req.body.username,
        pass: hashedPass,
        refreshToken: newRefreshToken || '',
        googleId: '',
        status: 'online'
    });
    req.flash('user', {
        email: newUser.email,
        username: newUser.username,
    });
    return res.redirect('/');
}

// * ------- GOOGLE -------
const google = (req, res) => {
    // `req` stored user, newAccessToken and newRefreshToken from previous middleware
    res.cookie('accessToken', req.user.newAccessToken, cookieConfig.accessToken);
    res.cookie('refreshToken', req.user.newRefreshToken, cookieConfig.refreshToken);
    req.flash('user', {
        email: req.user.user.email,
        username: req.user.user.username,
    });
    return res.redirect('/');
}

const logout = async (req, res) => {
    // Clear user data into session
    if(req.session.user) req.session.destroy();
    // Remove refresh token
    if(req.cookies.accessToken){
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // Clear refresh token in database
        await UserService.update({ email: req.email }, { refreshToken: ''});
    }
    return res.json({
        success: true,
        msg: 'Logout successfully'
    });
}

module.exports = { login, register, google, logout }