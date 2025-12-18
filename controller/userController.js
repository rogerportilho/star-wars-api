// controller/userController.js
const userService = require('../service/userService');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    const user = await userService.register(username, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }
    // Tenta login master
    const { masterLogin } = require('../service/authService');
    const masterToken = masterLogin(email, password);
    if (masterToken) {
      return res.json({ token: masterToken });
    }
    // Login normal
    const token = await userService.login(email, password);
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
  const User = require('../model/user');
  // Retorna todos os usuários cadastrados (sem senha)
  const users = (User.getAll ? await User.getAll() : []).map(u => ({ id: u.id, username: u.username, email: u.email }));
  res.json(users);
};

