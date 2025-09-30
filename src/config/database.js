// config/database.js
const { Sequelize } = require('sequelize');

// Tus credenciales extraídas de la URL
const DB_NAME = 'railway';
const DB_USER = 'postgres';
const DB_PASS = 'UxgzpCWfElbBeYJmANxSajJmIXzTVpjm';
const DB_HOST = 'turntable.proxy.rlwy.net'; 
const DB_PORT = 52952;


const sequelize = new Sequelize(
  DB_NAME, 
  DB_USER,
  DB_PASS, 
 {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
    
    // 🛑 ADICIÓN CRÍTICA PARA RAILWAY/PRODUCCIÓN
    // Fuerza a Sequelize a usar SSL, lo cual es requerido por los
    // servicios de bases de datos remotos por seguridad.
    dialectOptions: {
        ssl: {
            require: true,
            // Permite conexiones aunque el certificado no sea verificado por una CA pública
            // (necesario en muchos servicios PaaS).
            rejectUnauthorized: false
        }
    }
  }
);

module.exports = sequelize;