const characterService = require('../service/characterService');

exports.getAllCharacters = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const characters = await characterService.getAllCharacters();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCharacterById = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const character = await characterService.getCharacterById(req.params.id);
    if (!character) return res.status(404).json({ error: 'Character not found' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCharacter = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const { name, status, location, lastSeen } = req.body;
    if (!name || !status || !location || !lastSeen) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, status, location, lastSeen' });
    }
    const character = await characterService.createCharacter({ name, status, location, lastSeen });
    res.status(201).json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCharacter = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const { name, status, location, lastSeen } = req.body;
    const character = await characterService.updateCharacter(req.params.id, { name, status, location, lastSeen });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    res.json(character);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

