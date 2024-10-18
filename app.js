import { config } from "dotenv";
import cors from "cors";
import express from "express";
import mysql from "mysql2";
import scheduleOptionsTask from "./src/cron/optionsJob.js";

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

config();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

scheduleOptionsTask();

//import routes
import webHookRoutes from './src/routes/webhook.js';
import userRoutes from './src/routes/user.js';
import optionRoutes from './src/routes/option.js'
import licenseRoutes from './src/routes/license.js'
console.log(new Date());

app.use(cors());

app.get("/health", (req, res) => {
  console.log("testenv", process.env.FRONT_END_BASE_URL);
  res.json({ messege: "application is ready!" });
});
app.get("/", (req, res) => {
  res.json({ messege: "success" });
});

app.post("/anpr", (req, res) => {
  console.log(req.body)
  console.log(JSON.stringify(req.body))
  res.json({ messege: "success" });
});
app.use('/webhook', webHookRoutes);
app.use('/user', userRoutes)
app.use('/options', optionRoutes)
app.use('/license', licenseRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
