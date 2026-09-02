const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { AuthenticationError } = require('../errors/authErrors.js');

async function registerUser(username,password){
    const incUsername = username;
    const incPassword = password;
    const passwordHash = await bcrypt.hash(incPassword, 10);
    const user = await prisma.User.create({
        data: {
            username: incUsername,
            password: passwordHash
        }
    });
    return { id: user.id, username: user.username };
};

async function loginUser(username, password){
    const incUsername = username;
    const incPassword = password;
    const user = await prisma.User.findUnique({
        where: {
            username: incUsername
        }
    });
    if(!user){
        throw new AuthenticationError('authentication failed');
    }
    const isMatch = await bcrypt.compare(incPassword, user.password);
    if (!isMatch){
        throw new AuthenticationError('authentication failed');
    }
    return { id: user.id, username: user.username };
};


module.exports = {
    registerUser,
    loginUser
};