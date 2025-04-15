const db = require("./public/database/db");

(async () => {
    try {
        const result = await db.query("SELECT NOW()");
        console.log("Conexão bem-sucedida:", result.rows[0]);
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
    } finally {
        process.exit();
    }
})();
