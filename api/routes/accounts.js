const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Gerencie suas contas bancárias." });
});

module.exports = router;
