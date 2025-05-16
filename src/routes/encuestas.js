const express = require('express');
const router = express.Router();
const encuestaController = require('../controller/encuestaController');

// Formulario para crear encuesta
router.get('/crear-encuesta', encuestaController.mostrarFormularioEncuesta);

// Guardar encuesta
router.post('/guardar-encuesta', encuestaController.guardarEncuesta);

router.post('/votar', encuestaController.votarEncuesta);


module.exports = router;
