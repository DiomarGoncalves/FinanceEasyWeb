const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Visualize e gerencie suas transações financeiras." });
});

module.exports = router;
