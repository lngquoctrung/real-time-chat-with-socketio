const jwt = require('jsonwebtoken');

class Token {
    constructor(secretKey, expiresIn){
        this.secretKey = secretKey;
        this.expiresIn = expiresIn;
    }

    sign(data){
        return jwt.sign(
            data,
            this.secretKey,
            {
                expiresIn: this.expiresIn,
            }
        );
    }

    verify(token){
        return jwt.verify(token, this.secretKey);
    }
}

const accessToken = new Token(process.env.ACCESS_TOKEN_KEY, '15m');
const refreshToken = new Token(process.env.REFRESH_TOKEN_KEY, '24h');

module.exports = { accessToken, refreshToken };