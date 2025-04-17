const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Acompanhe o desempenho de suas finanças ao longo do tempo." });
});

module.exports = router;
