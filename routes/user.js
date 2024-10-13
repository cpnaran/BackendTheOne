const express = require("express");
const router = express.Router();

router.post("/submit", (req, res) => {
  const { userId } = req.query;
  console.log(userId);
  // create user in database

  res.json("success");
});
router.get("/health", (req, res) => {
  console.log("testenv", process.env.FRONT_END_BASE_URL);
  res.json({ messege: "application is ready!" });
});

module.exports = router;
