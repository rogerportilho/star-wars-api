// model/user.js
const users = [];
let idCounter = 1;

exports.create = ({ username, password }) => {
  const user = { id: idCounter++, username, password };
  users.push(user);
  return { id: user.id, username: user.username };
};

exports.findByUsername = async (username) => {
  return users.find(u => u.username === username);
};

exports.findById = async (id) => {
  return users.find(u => u.id === id);
};

exports.getAll = async () => users;
