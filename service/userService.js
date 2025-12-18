
// service/userService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET || 'starwars_secret';

exports.register = async (username, email, password) => {
  const existingUsername = await User.findByUsername(username);
  if (existingUsername) throw new Error('Usuário já existe');
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) throw new Error('Email já existe');
  const hash = await bcrypt.hash(password, 10);
  return User.create({ username, email, password: hash });
};

exports.login = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw new Error('Usuário não encontrado');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Senha inválida');
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

exports.getMe = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('Usuário não encontrado');
  return { id: user.id, username: user.username, email: user.email };
};

