import { config } from "dotenv";
import cors from "cors";
import express from "express";
import mysql from "mysql2";
import scheduleOptionsTask from "./src/cron/optionsJob.js";
import scheduleNotifyTask from "./src/cron/notify.job.js";

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL;

config();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

scheduleOptionsTask();
scheduleNotifyTask();

//import routes
import webHookRoutes from "./src/routes/webhook.js";
import userRoutes from "./src/routes/user.js";
import optionRoutes from "./src/routes/option.js";
import licenseRoutes from "./src/routes/license.js";
import anprRoutes from "./src/routes/anpr.js";
import backOfficeRoutes from "./src/routes/backOffice.js";
import { authenticateToken } from "./src/middleware/auth.js";
import authRoutes from "./src/routes/auth.js";
console.log(new Date());

app.use(cors());

app.get("/health", (req, res) => {
  console.log("testenv", process.env.FRONT_END_BASE_URL);
  res.json({ messege: "application is ready!" });
});
app.get("/", (req, res) => {
  res.json({ messege: "success" });
});

app.use("/anpr", anprRoutes);
app.use("/webhook", webHookRoutes);
app.use("/user", userRoutes);
app.use("/options", optionRoutes);
app.use("/license", licenseRoutes);
app.use("/back-office/", authenticateToken, backOfficeRoutes);
app.use("/Login", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
