const express = require("express");
const router = express.Router();
const db = require("../conexion");

// Ruta para manejar "Me Gusta"
router.post("/like", (req, res) => {
  const id_publicacion = req.body.id_publicacion;
  const id_usuario = req.body.id_usuario;

  // Verificar si el usuario ya dio "Me Gusta"
  db.query(
    "SELECT * FROM like_publicacion WHERE id_usuario = ? AND id_publicacion = ?",
    [id_usuario, id_publicacion],
    (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (result.length === 0) {
        // Insertar "Me Gusta" y actualizar contador
        db.query(
          "INSERT INTO like_publicacion (id_usuario, id_publicacion) VALUES (?, ?)",
          [id_usuario, id_publicacion],
          (err) => {
            if (err) {
              console.error("Error al insertar like:", err);
              return res.status(500).json({ error: "Error al dar like" });
            }

            // Actualizar número de likes
            db.query(
              "UPDATE publicaciones SET num_like = num_like + 1 WHERE id = ?",
              [id_publicacion],
              (err) => {
                if (err) {
                  console.error("Error al actualizar número de likes:", err);
                  return res.status(500).json({ error: "Error al actualizar likes" });
                }

                obtenerNumLikes(id_publicacion, res, true);
              }
            );
          }
        );
      } else {
        // Si ya dio "Me Gusta", eliminarlo y actualizar contador
        db.query(
          "DELETE FROM like_publicacion WHERE id_usuario = ? AND id_publicacion = ?",
          [id_usuario, id_publicacion],
          (err) => {
            if (err) {
              console.error("Error al quitar like:", err);
              return res.status(500).json({ error: "Error al quitar like" });
            }

            // Actualizar número de likes
            db.query(
              "UPDATE publicaciones SET num_like = num_like - 1 WHERE id = ?",
              [id_publicacion],
              (err) => {
                if (err) {
                  console.error("Error al actualizar número de likes:", err);
                  return res.status(500).json({ error: "Error al actualizar likes" });
                }

                obtenerNumLikes(id_publicacion, res, false);
              }
            );
          }
        );
      }
    }
  );
});

function obtenerNumLikes(id_publicacion, res, liked) {
  db.query(
      "SELECT COUNT(*) AS num_like FROM like_publicacion WHERE id_publicacion = ?",
      [id_publicacion],
      (err, result) => {
          if (err) {
              console.error("Error al obtener número de likes:", err);
              return res.status(500).json({ error: "Error en el servidor" });
          }

          const likes = result[0].num_like;
          const megusta = liked
              ? "<i class='fa-solid fa-thumbs-up fa-2x'></i>"
              : "<i class='fa-regular fa-thumbs-up fa-2x'></i>";

          res.json({ likes, text: megusta });
      }
  );
}


module.exports = router;
