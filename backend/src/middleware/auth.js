const jwt = require('jsonwebtoken');

/** Exige un token válido (cualquier rol: admin o prefecto). */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, nombre, rol }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Sesión inválida o expirada' });
  }
}

/** Exige, además de estar autenticado, tener rol de administrador. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Se requiere rol de administrador' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
