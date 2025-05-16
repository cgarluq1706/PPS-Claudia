const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

router.get('/:id',chatController.ver);
router.get('/chat/:id', chatController.escribir);

module.exports = router;
