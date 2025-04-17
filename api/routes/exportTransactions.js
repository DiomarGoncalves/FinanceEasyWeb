const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Exporte suas transações financeiras para arquivos." });
});

module.exports = router;
