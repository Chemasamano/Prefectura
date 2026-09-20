require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const yaHayDatos = await prisma.estudiante.count();
  if (yaHayDatos > 0) {
    console.log('La base de datos ya tiene estudiantes cargados. El seed no vuelve a insertar (evita duplicados).');
    console.log('Si quieres reiniciar todo desde cero, borra prisma/dev.db y vuelve a correr "npm run prisma:migrate" y "npm run seed".');
    return;
  }

  // ---- Estudiantes ----
  const estudiantesPath = path.join(__dirname, 'seed-data', 'estudiantes.json');
  const estudiantes = JSON.parse(fs.readFileSync(estudiantesPath, 'utf-8'));
  await prisma.estudiante.createMany({
    data: estudiantes.map((e) => ({
      nombre: e.n,
      grupo: e.g,
      activo: true,
      estatus: 'regular',
    })),
  });
  console.log(`Estudiantes insertados: ${estudiantes.length}`);

  // ---- Horarios (44 grupos, 3 PDFs de la coordinación académica) ----
  const horariosPath = path.join(__dirname, 'seed-data', 'horarios.json');
  const horarios = JSON.parse(fs.readFileSync(horariosPath, 'utf-8'));
  const filasSesiones = [];
  for (const [grupo, dias] of Object.entries(horarios)) {
    for (const [dia, sesiones] of Object.entries(dias)) {
      for (const s of sesiones) {
        filasSesiones.push({
          grupo, dia, modulo: s.modulo, inicio: s.inicio, fin: s.fin,
          materia: s.materia, profesor: s.profesor, aula: s.aula,
        });
      }
    }
  }
  await prisma.sesion.createMany({ data: filasSesiones });
  console.log(`Sesiones de horario insertadas: ${filasSesiones.length} (${Object.keys(horarios).length} grupos)`);

  // ---- Usuario administrador inicial ----
  const usuario = process.env.SEED_ADMIN_USUARIO || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'CambiaEstaClave123';
  const nombre = process.env.SEED_ADMIN_NOMBRE || 'Administrador';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.usuario.create({
    data: { nombre, usuario, passwordHash, rol: 'admin', activo: true },
  });
  console.log(`\nUsuario administrador creado:`);
  console.log(`  Usuario:  ${usuario}`);
  console.log(`  Password: ${password}`);
  console.log(`  *** Inicia sesión y crea tu propio usuario cuanto antes; este es solo para arrancar. ***`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
