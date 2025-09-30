const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role');

const User = sequelize.define('User', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName:  { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  gender:    { type: DataTypes.STRING, allowNull: false, defaultValue: 'unspecified' },
  password:  { type: DataTypes.STRING, allowNull: false },
  role_id:   {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'roles', key: 'id' }, // referencia al tableName
  },
}, {
  tableName: 'users',
  timestamps: true,
});

// Relaciones (defínelas una vez)
User.belongsTo(Role, { foreignKey: 'role_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });
Role.hasMany(User,  { foreignKey: 'role_id', onUpdate: 'CASCADE', onDelete: 'SET NULL' });

module.exports = User;
