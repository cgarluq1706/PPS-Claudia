const express = require('express');
const router = express.Router();
const followController = require('../controller/followController');

router.get('/perfil/:username/siguiendo',  followController.yosigo);
router.get('/perfil/:username/seguidores', followController.mesiguen);
router.get('/perfilajeno/:username/seguidores', followController.lesiguen);
router.get('/perfilajeno/:username/siguiendo',followController.elsigue);
module.exports = router;