const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Visualize relatórios detalhados sobre suas finanças." });
});

module.exports = router;
