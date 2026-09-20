const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login  { usuario, password } -> { token, usuario: {nombre, rol} }
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
  }

  const registro = await prisma.usuario.findUnique({ where: { usuario } });
  if (!registro || !registro.activo) {
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }

  const ok = await bcrypt.compare(password, registro.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { id: registro.id, nombre: registro.nombre, rol: registro.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );

  res.json({ success: true, data: { token, nombre: registro.nombre, rol: registro.rol } });
});

// GET /api/auth/me  -> valida el token actual y regresa los datos de sesión
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: req.user });
});

// --- Gestión de usuarios (solo administrador) ---

// GET /api/auth/usuarios
router.get('/usuarios', requireAuth, requireAdmin, async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, usuario: true, rol: true, activo: true, creadoEn: true },
    orderBy: { nombre: 'asc' },
  });
  res.json({ success: true, data: usuarios });
});

// POST /api/auth/usuarios  { nombre, usuario, password, rol }
router.post('/usuarios', requireAuth, requireAdmin, async (req, res) => {
  const { nombre, usuario, password, rol } = req.body || {};
  if (!nombre || !usuario || !password || !['admin', 'prefecto'].includes(rol)) {
    return res.status(400).json({ success: false, message: 'Faltan datos o el rol no es válido' });
  }
  const existe = await prisma.usuario.findUnique({ where: { usuario } });
  if (existe) {
    return res.status(409).json({ success: false, message: 'Ese nombre de usuario ya existe' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const nuevo = await prisma.usuario.create({
    data: { nombre, usuario, passwordHash, rol, activo: true },
    select: { id: true, nombre: true, usuario: true, rol: true, activo: true },
  });
  res.status(201).json({ success: true, data: nuevo });
});

// PATCH /api/auth/usuarios/:id  { activo? , rol? }
router.patch('/usuarios/:id', requireAuth, requireAdmin, async (req, res) => {
  const { activo, rol } = req.body || {};
  const cambios = {};
  if (typeof activo === 'boolean') cambios.activo = activo;
  if (rol && ['admin', 'prefecto'].includes(rol)) cambios.rol = rol;
  const actualizado = await prisma.usuario.update({
    where: { id: req.params.id },
    data: cambios,
    select: { id: true, nombre: true, usuario: true, rol: true, activo: true },
  });
  res.json({ success: true, data: actualizado });
});

module.exports = router;
