const express = require('express');
const router = express.Router();

// Controlador para Contacto
const contactoController = require('../controller/contactoController');

// Ruta para la página de Contacto
router.get('/contacto', contactoController.getContacto);

module.exports = router;
