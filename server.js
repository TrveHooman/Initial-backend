const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
const { register, login, authenticateToken } = require('./controllers/authController');

app.get('/', (req,res) => {
    res.send("Welcome to the backend server!");
});

app.get('/api/status', authenticateToken, (req,res) => {
    res.json(
        { 
            status: "operational",
            security_level: "high",
            username:  req.user.username
        }
    );
}
);

app.post('/api/login', login);

app.post('/api/register', register);


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