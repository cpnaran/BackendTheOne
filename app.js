require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

//import routes
const webHookRoutes = require('./routes/webhook');
const userRoutes = require('./routes/user')

app.use('/webhook', webHookRoutes);
app.use('/user', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
