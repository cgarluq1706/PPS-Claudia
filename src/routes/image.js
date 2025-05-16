const express = require('express');
const router = express.Router();
//
const imageController = require('../controller/imageController');

router
    //login
    .get('/imagen/:id',imageController.getImage)
    .get('/imagenID/:id',imageController.getImageId)
    .post('/modifica_foto2', imageController.modificaFoto);
    

module.exports = router;