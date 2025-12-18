// model/user.js
const users = [];
let idCounter = 1;

exports.create = ({ username, email, password }) => {
  const user = { id: idCounter++, username, email, password };
  users.push(user);
  return { id: user.id, username: user.username, email: user.email };
};

exports.findByUsername = async (username) => {
  return users.find(u => u.username === username);
};

exports.findByEmail = async (email) => {
  return users.find(u => u.email === email);
};

exports.findById = async (id) => {
  return users.find(u => u.id === id);
};

exports.getAll = async () => users;
