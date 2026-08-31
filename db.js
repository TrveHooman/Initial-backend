const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

async function setupDatabase() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )    
    `);

    const hashedPassword = await bcrypt.hash("hunter2", 10);
    await db.run(
        `INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`,
        ["admin", hashedPassword]
    );

    console.log("Database initialized securely.");
    return db;
};

module.exports = setupDatabase;