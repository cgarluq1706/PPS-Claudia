
const express = require("express");
const router = express.Router();
const db = require("../conexion");

// Bloquear a un usuario
router.post("/bloquear/:id", (req, res) => {
  const bloqueador = req.session.userId;
  const bloqueado = req.params.id;

  if (!bloqueador) {
    return res.status(401).send("Usuario no autenticado.");
  }

  const query = "INSERT IGNORE INTO bloqueos (bloqueador_id, bloqueado_id) VALUES (?, ?)";

  db.query(query, [bloqueador, bloqueado], (err) => {
    if (err) {
      console.error("Error al bloquear usuario:", err);
      return res.status(500).send("Error al bloquear usuario.");
    }
    res.redirect("back");
  });
});

// Desbloquear a un usuario
router.post("/desbloquear/:id", (req, res) => {
  const bloqueador = req.session.userId;
  const bloqueado = req.params.id;

  if (!bloqueador) {
    return res.status(401).send("Usuario no autenticado.");
  }

  const query = "DELETE FROM bloqueos WHERE bloqueador_id = ? AND bloqueado_id = ?";

  db.query(query, [bloqueador, bloqueado], (err) => {
    if (err) {
      console.error("Error al desbloquear usuario:", err);
      return res.status(500).send("Error al desbloquear usuario.");
    }
    res.redirect("back");
  });
});

module.exports = router;
