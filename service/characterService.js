
// service/characterService.js
const Character = require('../model/character');

exports.getAllCharacters = async () => Character.getAll();
exports.getCharacterById = async (id) => Character.getById(id);
exports.createCharacter = async (data) => Character.create(data);
exports.updateCharacter = async (id, data) => Character.update(id, data);

