const { accessToken, refreshToken } = require('../../config/jwt');
const cookieConfig = require('../../config/cookieConfig');

const authPaths = ['login', 'register', 'google'];

const checkAuthenticated = (req, res) => {
    // Check accessToken if user click remember me
    if(req.cookies.accessToken || req.cookies.refreshToken){
        try{
            const decode = accessToken.verify(req.cookies.accessToken);
            req.flash('user', {
                email: decode.email,
                username: decode.username
            });
            return true;
        }
        catch(error){
            // Access token has expired
            if(req.cookies.refreshToken){
                try{
                    const decode = refreshToken.verify(req.cookies.refreshToken);
                    // Generate new access token by refresh token
                    const newAccessToken = accessToken.sign({
                        email: decode.email,
                        username: decode.username,
                    });
                    res.cookie('accessToken', newAccessToken, cookieConfig.accessToken);
                    req.flash('user', {
                        email: decode.email,
                        username: decode.username
                    });
                    return true;
                }
                // Refresh token is invalid
                catch(error){
                    return false;
                }
            }
            return false;
        }
    }
    // Check session if user without remember me
    if(!req.session.user) return false;
    else{
        req.flash('user', {
            email: req.session.user.email,
            username: req.session.user.username
        });
    }
    return true;
}

const authentication = (req, res, next) => {
    const isAuthPath = authPaths.some(path => 
        req.originalUrl.includes(path)
    );
    const isAuthenticated = checkAuthenticated(req, res);
    // Avoid accessing login or registration pages after authentication
    if(isAuthPath && isAuthenticated)
        return res.redirect('/');
    // Allow access to login or registration pages without authentication
    else if(isAuthPath && !isAuthenticated){
        return next();
    }
    // Require authentication to access home page
    else if(!isAuthPath && !isAuthenticated)
        return res.redirect('/login');
    // Authenticated
    else return next();
}

module.exports = authentication;