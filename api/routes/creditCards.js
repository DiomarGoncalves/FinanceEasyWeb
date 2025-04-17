const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Gerencie seus cartões de crédito." });
});

module.exports = router;
