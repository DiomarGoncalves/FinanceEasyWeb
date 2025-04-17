const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Gerencie as tags para organizar suas transações." });
});

module.exports = router;
