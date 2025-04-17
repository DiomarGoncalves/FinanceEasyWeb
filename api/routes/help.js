const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Encontre respostas para suas dúvidas ou entre em contato com o suporte." });
});

module.exports = router;
