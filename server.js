const express = require('express');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
app.use(express.json());

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        return res.status(401).json({ message: "Token Missing" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message : "Invalid or expired token"});
        };

        req.user = decoded;
        next();
    });
};

app.get('/', (req,res) => {
    res.send("Welcome to the backend server!");
});

app.get(
    '/api/status', 
    authenticateToken,
    (req,res) => {
        res.json(
            { 
                status: "operational",
                security_level: "high",
                username:  req.user.username
            }
        );
    }
);

app.post('/api/login', async(req,res) => {
    const incUsername = req.body.username;
    const incPassword = req.body.password;
    const user = await prisma.User.findUnique({
        where: {
            username: incUsername
        }
    });
    if(!user){
        return res.status(401).json({ "error": "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(incPassword, user.password);
    if (!isMatch){
        return res.status(401).json({ "error": "Invalid credentials" });
    }
    const payload = {
        sub: user.id, 
        username: user.username 
    };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, {
        expiresIn: '15m'
    });
    return res.json({ 
        "message": "Login successful",
        "accessToken": token
     });
});



app.post('/api/register', async(req,res) => {

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
        return res.status(400).json({ error: "Invalid credentials" });
    };
    try {
        const passwordHash = await bcrypt.hash(incPassword, 10);
        const user = await prisma.User.create({
            data: {
                username: incUsername,
                password: passwordHash
            }
        });
        const payload = {
            sub: user.id, 
            username: user.username 
        };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '15m'
        });
        return res.json({ 
            "message": "Registeration successful",
            "accessToken": token
            });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                return res.status(409).json({ error: "There is a unique constraint violation"});
            }
        }
        console.log()
        console.error(" Error: ", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
    
});



async function startServer() {
    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running and listening on http://localhost:${PORT}`);
        });
    } catch(error) {
        console.error("Fatal Error: Could not start application:", error);
    };
};
startServer();
