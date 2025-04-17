const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Crie e acompanhe seus planejamentos financeiros." });
});

module.exports = router;
