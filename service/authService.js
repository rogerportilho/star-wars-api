// service/authService.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'starwars_secret';

// Usuário master fixo
const MASTER_USER = { username: 'Rogerio', password: '123456', id: 0 };

// Middleware para autenticação JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }
  return res.status(401).json({ error: 'Token não informado' });
}

// Função para login do usuário master
function masterLogin(username, password) {
  if (
    username &&
    username.toLowerCase() === MASTER_USER.username.toLowerCase() &&
    password === MASTER_USER.password
  ) {
    // Retorna um token JWT para o usuário master
    return jwt.sign({ id: MASTER_USER.id, username: MASTER_USER.username, master: true }, JWT_SECRET, { expiresIn: '2h' });
  }
  return null;
}

module.exports = {
  authenticateJWT,
  masterLogin,
};
