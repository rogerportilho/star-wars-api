// model/character.js
let characters = [
  { id: 1, name: 'Darth Vader', status: 'Falecido', location: 'Estrela da Morte II', lastSeen: 'Star Wars: Episódio IV' },
  { id: 2, name: 'Yoda', status: 'Falecido', location: 'Dagobah', lastSeen: 'Star Wars: Episódio V' },
  { id: 3, name: 'Luke Skywalker', status: 'Falecido', location: 'Ahch-To', lastSeen: 'Star Wars: Episódio IV' },
  { id: 4, name: 'Princesa Leia', status: 'Falecida', location: 'Alderaan', lastSeen: 'Star Wars: Episódio IV' },
  { id: 5, name: 'Han Solo', status: 'Falecido', location: 'Millennium Falcon', lastSeen: 'Star Wars: Episódio IV' },
  { id: 6, name: 'Obi-Wan Kenobi', status: 'Falecido', location: 'Tatooine', lastSeen: 'Star Wars: Episódio IV' },
  { id: 7, name: 'Palpatine', status: 'Falecido', location: 'Exegol', lastSeen: 'Star Wars: Episódio III' },
  { id: 8, name: 'Chewbacca', status: 'Vivo', location: 'Millennium Falcon', lastSeen: 'Star Wars: Episódio IV' },
  { id: 9, name: 'R2-D2', status: 'Vivo', location: 'Resistência', lastSeen: 'Star Wars: Episódio IV' },
  { id: 10, name: 'C-3PO', status: 'Vivo', location: 'Resistência', lastSeen: 'Star Wars: Episódio IV' },
  { id: 11, name: 'Rey', status: 'Vivo', location: 'Tatooine', lastSeen: 'Star Wars: Episódio VII' },
  { id: 12, name: 'Kylo Ren', status: 'Falecido', location: 'Exegol', lastSeen: 'Star Wars: Episódio VII' },
  { id: 13, name: 'Darth Maul', status: 'Falecido', location: 'Mandalore', lastSeen: 'Star Wars: Episódio I' },
  { id: 14, name: 'Mace Windu', status: 'Falecido', location: 'Coruscant', lastSeen: 'Star Wars: Episódio I' },
  { id: 15, name: 'Padmé Amidala', status: 'Falecida', location: 'Naboo', lastSeen: 'Star Wars: Episódio I' }
];
let nextId = 16;

exports.getAll = async () => characters;
exports.getById = async (id) => characters.find(c => c.id == id);
exports.create = async (data) => {
  const character = { id: nextId++, ...data };
  characters.push(character);
  return character;
};
exports.update = async (id, data) => {
  const idx = characters.findIndex(c => c.id == id);
  if (idx === -1) return null;
  characters[idx] = { ...characters[idx], ...data, id: Number(id) };
  return characters[idx];
};
