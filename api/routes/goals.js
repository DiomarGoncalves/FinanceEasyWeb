const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Defina e acompanhe seus objetivos financeiros." });
});

module.exports = router;
