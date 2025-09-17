// routes/characterRoutes.js
const express = require('express');
const router = express.Router();
const characterController = require('../../controller/characterController');

router.get('/', characterController.getAllCharacters);
router.get('/:id', characterController.getCharacterById);
router.post('/', characterController.createCharacter);
router.put('/:id', characterController.updateCharacter);

module.exports = router;
