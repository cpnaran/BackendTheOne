const express = require("express");
const router = express.Router();
console.log("testenv", process.env.FRONT_END_BASE_URL);
router.post("/submit", (req, res) => {
  const { userId } = req.query;
  console.log(userId);
  // create user in database

  res.json("success");
});

module.exports = router;
