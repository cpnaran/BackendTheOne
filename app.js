import { config } from 'dotenv';
import express from 'express';
import mysql from 'mysql2'

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

config()

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//import routes
import webHookRoutes from './src/routes/webhook.js';
import userRoutes from './src/routes/user.js';
console.log(new Date())
app.get("/health", (req, res) => {
    console.log("testenv", process.env.FRONT_END_BASE_URL);
    res.json({ messege: "application is ready!" });
});
app.use('/webhook', webHookRoutes);
app.use('/user', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
