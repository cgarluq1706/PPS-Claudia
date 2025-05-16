const express = require('express');
const router = express.Router();
const perfilController = require('../controller/perfilController');

router.post('/actualizar-perfil',  perfilController.actualizarperfil);
router.get('/perfil',  perfilController.verperfil);
router.get('/perfilajeno/:username', perfilController.perfilajeno);

module.exports = router;