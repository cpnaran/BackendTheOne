import express, { response } from "express";

import feature from "../feature/index.js";

const router = express.Router();

router.get("/Revenue", getMonthlyRevenue);
router.get("/Revenue/graph", getGraph);
router.get("/Total-car", getTotalCar);
router.get("/Total-car/graph", getCarGraph);
router.get("/Package-summary", getPackageSummary);

router.post("/add-package", createPakage);
router.put("/update-package", updatePackage);
router.delete("/delete-package/:id", deletePackage);
router.get("/Package/list", getPackageTable);
router.get("/Usage-Time", getUsageTime);

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

async function getGraph(req, res, next) {
  try {
    const { year } = req.query;
    const response = await feature.backOffice.getGraph(year);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}
async function getPackageSummary(req, res, next) {
  try {
    const { year } = req.query;
    const response = await feature.backOffice.getPackageSummary(year);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function createPakage(req, res, next) {
  try {
    const data = req.body;
    const response = await feature.backOffice.createPackage(data);
    res.json("created");
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function updatePackage(req, res, next) {
  try {
    const data = req.body;
    const response = await feature.backOffice.updatePackage(data);
    res.json("updated");
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}
async function deletePackage(req, res, next) {
  try {
    const { id } = req.params;
    const response = await feature.backOffice.deletePackage(id);
    res.json("deleted");
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function getCarGraph(req, res, next) {
  try {
    const { year } = req.query;
    const response = await feature.backOffice.getCarGraph(year);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function getPackageTable(req, res) {
  try {
    const response = await feature.backOffice.getPackageTable();
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function getUsageTime(req, res) {
  try {
    const response = await feature.backOffice.getUsageTime();
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

export default router;
