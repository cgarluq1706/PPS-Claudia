const express = require('express');
const router = express.Router();
const publicacionesController = require('../controller/publicacionesController');

// Ruta para obtener comentarios de una publicación
// Esta ruta recibe el 'publicacion_id' como parámetro
router.get("/comentarios/:publicacion_id", publicacionesController.getComentarios);

// Ruta para agregar un nuevo comentario
// Esta ruta recibe los datos del comentario (publicacion_id y contenido) en el cuerpo de la solicitud
router.post("/comentarios", publicacionesController.agregarComentario);

module.exports = router;
