const { Prisma } = require('@prisma/client');
const { registerUser, loginUser } = require('../services/authService.js');
const { AuthenticationError } = require('../errors/authErrors.js');
const { createAccessToken } = require('../utils/jwt.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');

async function register(req,res){
    const incUsername = req.body.username;
    const incPassword = req.body.password;
    if(
        !incUsername ||
        !incPassword ||
        typeof(incUsername) !== 'string' ||
        typeof(incPassword) !== 'string' ||
        incUsername.length < 1 ||
        incPassword.length < 1
    ){
        return res.status(400).json({ error: "Invalid Input" });
    };
    try {
        const user = await registerUser(incUsername, incPassword);
        
        return res.json({ 
            "message": "Registration successful",
            "accessToken": createAccessToken(user)
         });
    } catch(err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                return res.status(409).json({ err: "Unique constraint violation" });
            }
        }
        return res.status(500).json({ err: "Something went wrong" });
    };
};


async function login(req,res){
    const incUsername = req.body.username;
    const incPassword = req.body.password;
    if(
        !incUsername ||
        !incPassword ||
        typeof(incUsername) !== 'string' ||
        typeof(incPassword) !== 'string' ||
        incUsername.length < 1 ||
        incPassword.length < 1
    ){
        return res.status(400).json({ error: "Invalid Input" });
    };
    try {
        const user = await loginUser(incUsername, incPassword);

        return res.json({ 
            "message": "Login successful",
            "accessToken": createAccessToken(user)
         });
    } catch (err){
        if(err instanceof AuthenticationError){
            return res.status(401).json({ err: "Invalid credentials" });
        }
        console.log(err);
        return res.status(500).json({ err: "Something went wrong" });
    }
};

module.exports = {
    register,
    login,
    authenticateToken
};