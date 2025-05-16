const express = require("express");
const connection = require("../conexion");
const router = express.Router();

router.get("/buscar", (req, res) => {
    const query = req.query.q;

    if (!query) return res.json([]);

    const sql = `
        SELECT id, nombre, apellido, username, foto_perfil 
        FROM usuarios 
        WHERE nombre LIKE ? OR apellido LIKE ? OR username LIKE ?
        LIMIT 10
    `;

    connection.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`], (err, results) => {
        if (err) {
            console.error("Error en la búsqueda:", err);
            return res.status(500).json({ error: "Error en el servidor" });
        }

        const usuarios = results.map(user => ({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            username: user.username,
            foto: user.foto_perfil
                ? `data:image/jpeg;base64,${user.foto_perfil.toString("base64")}`
                : null
        }));

        res.json(usuarios);
    });
});

module.exports = router;
