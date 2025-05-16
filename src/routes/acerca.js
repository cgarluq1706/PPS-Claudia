const express = require('express');
const router = express.Router();

// Controlador para Acerca
const acercaController = require('../controller/acercaController');

// Ruta para la página de Acerca
router.get('/acerca', acercaController.getAcerca);

module.exports = router;
