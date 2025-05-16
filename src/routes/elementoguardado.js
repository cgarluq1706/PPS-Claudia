const express = require("express");
const router = express.Router();
const db = require("../conexion");

router.post("/elementoguardado", (req, res) => {
  const id_publicacion = req.body.id_publicacion;
  const id_usuario = req.body.id_usuario;

  db.query(
    "SELECT * FROM guardar_publicacion WHERE id_usuario = ? AND id_publicacion = ?",
    [id_usuario, id_publicacion],
    (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (result.length === 0) {
        db.query(
          "INSERT INTO guardar_publicacion (id_usuario, id_publicacion) VALUES (?, ?)",
          [id_usuario, id_publicacion],
          (err) => {
            if (err) {
              console.error("Error al guardar:", err);
              return res.status(500).json({ error: "Error al guardar" });
            }

            db.query(
              "UPDATE publicaciones SET num_guardado = num_guardado + 1 WHERE id = ?",
              [id_publicacion],
              (err) => {
                if (err) {
                  console.error("Error al actualizar número de guardados:", err);
                  return res.status(500).json({ error: "Error al actualizar guardado" });
                }

                obtenerNumguardado(id_publicacion, res, true);
              }
            );
          }
        );
      } else {
        db.query(
          "DELETE FROM guardar_publicacion WHERE id_usuario = ? AND id_publicacion = ?",
          [id_usuario, id_publicacion],
          (err) => {
            if (err) {
              console.error("Error al quitar guardado:", err);
              return res.status(500).json({ error: "Error al quitar guardado" });
            }

            db.query(
              "UPDATE publicaciones SET num_guardado = num_guardado - 1 WHERE id = ?",
              [id_publicacion],
              (err) => {
                if (err) {
                  console.error("Error al actualizar número de guardados:", err);
                  return res.status(500).json({ error: "Error al actualizar guardados" });
                }

                obtenerNumguardado(id_publicacion, res, false);
              }
            );
          }
        );
      }
    }
  );
});

function obtenerNumguardado(id_publicacion, res, guardadod) {
  db.query(
    "SELECT COUNT(*) AS num_guardado FROM guardar_publicacion WHERE id_publicacion = ?",
    [id_publicacion],
    (err, result) => {
      if (err) {
        console.error("Error al obtener número de guardados:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const guardados2 = result[0].num_guardado;
      const loguardo = guardadod
        ? "<i class='fa-solid fa-bookmark fa-2x'></i>"
        : "<i class='fa-regular fa-bookmark fa-2x'></i>";

      res.json({ guardados2, text: loguardo, esta_guardado: guardadod });
    }
  );
}



module.exports = router;
