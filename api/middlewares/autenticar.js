const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secreta";

module.exports = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Armazena o usuário decodificado na requisição
        next();
    } catch (error) {
        console.error("Erro ao verificar token:", error.message);
        res.status(401).json({ error: "Token inválido" });
    }
};
