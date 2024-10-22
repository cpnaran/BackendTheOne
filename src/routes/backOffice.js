import express, { response } from "express";
import feature from "../feature/index.js";

const router = express.Router();

router.get("/Revenue", getMonthlyRevenue);
router.get("/total-car", getTotalCar);

async function getMonthlyRevenue(req, res, next) {
  try {
    // const { deviceId, params } = req.body;
    const { month } = req.query;
    const response = await feature.backOffice.getMonthlyRevenue(+month);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function getTotalCar(req, res, next) {
  try {
    const response = await feature.backOffice.getTotalCar();
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

export default router;
