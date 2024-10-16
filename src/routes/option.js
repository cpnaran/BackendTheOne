import { Op } from "sequelize";
import Package from "../models/Package.js";
import features from "../feature/index.js";
import express from "express";

const router = express.Router();

router.get("/packages", getOptionPackage);
router.get("/license/:userId", getLicense);

async function getOptionPackage(req, res, next) {
  try {
    const response = await features.option.getOptionPackage();
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function getLicense(req, res, next) {
  try {
    const { userId } = req.params;
    const response = await features.option.getOptionLicense(userId);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

export default router;
