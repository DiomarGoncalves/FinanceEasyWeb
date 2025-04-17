const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Visualize suas transações e eventos financeiros no calendário." });
});

module.exports = router;
