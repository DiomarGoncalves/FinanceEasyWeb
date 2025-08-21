import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'dd59d6bec5bb7426b5fd2427cbeeb79dfe67e60bf9dedab06bc96fe037d105af');
    
    // Verificar se o token contém um ID válido
    if (!verified.id) {
      return res.status(403).json({ error: 'Token inválido - ID não encontrado' });
    }
    
    req.user = verified;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error.message);
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dd59d6bec5bb7426b5fd2427cbeeb79dfe67e60bf9dedab06bc96fe037d105af', { expiresIn: '1d' });
};