// src/config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProd = process.env.NODE_ENV === 'production';

function logWhereConnecting(kind) {
  console.log(`[DB] Connecting via ${kind} ${isProd ? '(prod, SSL on)' : '(dev, SSL off)'}`);
}

let sequelize;

if (process.env.DATABASE_URL) {
  // ✅ Caso A: tienes DATABASE_URL (como en tu screenshot)
  logWhereConnecting('DATABASE_URL');
  sequelize = new Sequelize(process.env.DATABASE_URL.replace(/^postgresql:\/\//, 'postgres://'), {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: isProd ? { require: true, rejectUnauthorized: false } : false,
    },
  });
} else if (process.env.PGHOST) {
  // ✅ Caso B: usa las variables PG* que Railway provee automáticamente
  const {
    PGHOST, PGPORT = 5432, PGUSER, PGPASSWORD, PGDATABASE,
  } = process.env;

  logWhereConnecting('PG* vars');

  sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    port: Number(PGPORT),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: isProd ? { require: true, rejectUnauthorized: false } : false,
    },
  });
} else {
  // ❌ Nada definido: falla explícitamente con un mensaje claro
  throw new Error(
    'No hay DATABASE_URL ni variables PG* en el entorno. ' +
    'Configura DATABASE_URL en Railway o usa PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.'
  );
}

module.exports = sequelize;
