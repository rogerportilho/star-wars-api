// controller/userController.js
const userService = require('../service/userService');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.register(username, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    // Permitir login via query params ou body
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
    }
    // Tenta login master
    const { masterLogin } = require('../service/authService');
    const masterToken = masterLogin(username, password);
    if (masterToken) {
      return res.json({ token: masterToken });
    }
    // Login normal
    const token = await userService.login(username, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  try {
    const user = await userService.getMe(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  // Só permite se for master
  if (!req.user || !req.user.master) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const User = require('../model/user');
  // Retorna todos os usuários cadastrados (sem senha)
  const users = (User.getAll ? await User.getAll() : []).map(u => ({ id: u.id, username: u.username }));
  res.json(users);
};

