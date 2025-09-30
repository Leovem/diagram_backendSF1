// config/database.js
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(
  'diagramBD',   
  'postgres',         
  '1256',     
  {
    host: '127.0.0.1', // o 'localhost'
    port: 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
