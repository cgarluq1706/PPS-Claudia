
const express = require("express");
const router = express.Router();
const db = require("../conexion");

router.post("/seguir", (req, res) => {
  const id_seguido = req.body.id_seguido;
  const id_usuario = req.body.id_usuario;
  if (id_seguido != id_usuario){
  db.query(
    "SELECT * FROM seguimiento WHERE seguidor_id = ? AND seguido_id = ?",
    [id_usuario, id_seguido],
    (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (result.length === 0) {
        db.query(
          "INSERT INTO seguimiento (seguidor_id, seguido_id) VALUES (?, ?)",
          [id_usuario, id_seguido],
          (err) => {
            if (err) {
              console.error("Error al insertar seguir:", err);
              return res.status(500).json({ error: "Error al dar seguir" });
            }
            obtenerNumSeguidos(id_seguido, res, true);
          }
        );
      } else {
        db.query(
          "DELETE FROM seguimiento WHERE seguidor_id = ? AND seguido_id = ?",
          [id_usuario, id_seguido],
          (err) => {
            if (err) {
              console.error("Error al quitar seguir:", err);
              return res.status(500).json({ error: "Error al quitar seguir" });
            }
            obtenerNumSeguidos(id_seguido, res, false);
          }
        );
      }
    }
  );
}
});

function obtenerNumSeguidos(id_seguido, res, seguidod) {
  db.query(
    "SELECT COUNT(*) AS total_seguidos FROM seguimiento WHERE seguido_id = ?;",
    [id_seguido],
    (err, result) => {
      if (err) {
        console.error("Error al obtener número de seguidos:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const seguidores = result[0].total_seguidos;
      const seguidoono = seguidod ? "dejar de seguir" : "seguir";

      res.json({ seguidores, text: seguidoono });
    }
  );
}

// NUEVA RUTA: mostrar usuarios que sigo con estado de bloqueo
router.get("/siguiendo", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const usuarioActualId = req.session.user.id;

  const query = `
    SELECT u.id, u.username, u.descripcion,
      EXISTS (
        SELECT 1 FROM bloqueos
        WHERE bloqueador_id = ? AND bloqueado_id = u.id
      ) AS bloqueado
    FROM seguimiento s
    JOIN usuarios u ON u.id = s.seguido_id
    WHERE s.seguidor_id = ?
  `;

  db.query(query, [usuarioActualId, usuarioActualId], (err, results) => {
    if (err) {
      console.error("Error al obtener usuarios seguidos:", err);
      return res.status(500).send("Error del servidor");
    }

    res.render("siguiendo", {
      siguiendo: results,
      usernameperfil: req.session.user.username,
    });
  });
});

module.exports = router;
