// controller/checkoutController.js
const TokenBlacklist = require('../model/tokenBlacklist');

exports.logout = async (req, res) => {
  try {
    // Adicionar token na blacklist
    TokenBlacklist.addToken(req.token);
    
    res.json({ 
      message: 'Logout realizado com sucesso',
      user: req.user.username 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { productId, quantity, paymentMethod } = req.body;
    if (!productId || !quantity || !paymentMethod) {
      return res.status(400).json({ error: 'ProductId, quantity e paymentMethod são obrigatórios' });
    }
    
    const checkoutData = {
      id: Date.now(),
      userId: req.user.id,
      productId,
      quantity,
      paymentMethod,
      total: quantity * 100, // Preço fictício
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(checkoutData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};