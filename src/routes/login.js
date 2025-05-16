const express = require('express');
const router = express.Router();
//
const loginController = require('../controller/loginController');

router
    //login
    .get("/login", loginController.login)
    //borrar logout
    .get("/logout", loginController.logout)
    .get('/', loginController.getIndex)
    .get('/dashboard',loginController.getDashboard)
    .post('/login', loginController.postLogin)
    .post('/register',loginController.postRegister)
    .get('/registro',loginController.getRegistro)
    .get('/comentarios',loginController.getComentarios)
    //.get('/publicaciones',loginController.getpublicaciones)
    .get('/perfil',loginController.getPerfil)
    .get('/error',loginController.getError);
    

module.exports = router;