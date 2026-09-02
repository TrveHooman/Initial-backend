const jwt = require('jsonwebtoken');

function createAccessToken(user){
    const payload = {
        sub: user.id, 
        username: user.username 
    };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, {
        expiresIn: '15m'
    });
    return token;
};


module.exports = {
    createAccessToken,
};