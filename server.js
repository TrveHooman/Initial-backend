const express = require('express');
const setupDatabase = require('./db');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

let db;

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
    const user = await db.get(`SELECT * FROM users WHERE username = ?`, [incUsername]);
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




async function startServer() {
    try {
        db = await setupDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running and listening on http://localhost:${PORT}`);
        });
    } catch(error) {
        console.error("Fatal Error: Could not start application:", error);
    };
};
startServer();
