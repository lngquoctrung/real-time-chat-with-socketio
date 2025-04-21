module.exports = {
    accessToken: {
        httpOnly: false,
        maxAge: 15 * 60 * 1000, // 15m
    },

    refreshToken: {
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000, // 1d
    }
}