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
//manage api
router.get("/Options/Premium", getPremiuimOptions);
router.get("/Car/list", getCarList);
router.put("/Car/Promote", promote);
router.put("/Car/Demote", demote);
router.put("/Car/Add-days", addDays);

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

async function getCarList(req, res) {
  try {
    const { page, per_page, license } = req.query;

    const response = await feature.backOffice.getCarList({
      page,
      per_page,
      license,
    });
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}
async function demote(req, res) {
  try {
    const { id } = req.body;
    const response = await feature.backOffice.demote(id);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

async function promote(req, res) {
  try {
    const { id, package_id } = req.body;
    const response = await feature.backOffice.promote(id, package_id);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}
async function addDays(req, res) {
  try {
    const { id, day } = req.body;
    const response = await feature.backOffice.AddDays(id, day);
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}
async function getPremiuimOptions(req, res) {
  try {
    const response = await feature.backOffice.getPremiumoptions();
    res.json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(400).send(error.message);
  }
}

export default router;
