require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const estudiantesRoutes = require('./routes/estudiantes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const horarioRoutes = require('./routes/horario.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Bitácora de Conducta API activa' }));

app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/horario', horarioRoutes);

// Manejador de errores genérico (evita que la API se caiga por un error no controlado)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API de Bitácora de Conducta escuchando en http://localhost:${PORT}`);
});
