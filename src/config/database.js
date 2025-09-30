// config/database.js
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(
  'railway',   
  'postgres',         
  'UxgzpCWfElbBeYJmANxSajJmIXzTVpjm',     
  {
    host: 'turntable.proxy.rlwy.net', // o 'localhost'
    port: 52952,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
