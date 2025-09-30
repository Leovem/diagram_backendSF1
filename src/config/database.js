// config/database.js
const { Sequelize } = require('sequelize')

const isProd = process.env.NODE_ENV === 'production'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: isProd
      ? { require: true, rejectUnauthorized: false }
      : false,
  },
})

module.exports = sequelize
