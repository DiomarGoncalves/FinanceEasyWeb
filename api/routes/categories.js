const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Gerencie as categorias de suas transações financeiras." });
});

module.exports = router;
