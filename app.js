require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2');

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database!');
        connection.release();  // Release the connection back to the pool
    }
});

//import routes
const webHookRoutes = require('./routes/webhook');
const userRoutes = require('./routes/user')

app.use('/webhook', webHookRoutes);
app.use('/user', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
