const express = require('express');
const router = express.Router();

// Controlador para Términos y Condiciones
const terminosController = require('../controller/terminosController');

// Ruta para la página de Términos y Condiciones
router.get('/terminos', terminosController.getTerminos);

module.exports = router;
