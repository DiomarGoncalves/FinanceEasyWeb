const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.json({ message: "Importe transações financeiras de arquivos ou bancos." });
});

module.exports = router;
