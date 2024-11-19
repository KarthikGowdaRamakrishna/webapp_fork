// src/models/EmailTracking.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Ensure it's the same sequelize instance as in User.js

const EmailTracking = sequelize.define('EmailTracking', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiryTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, // Disable automatic timestamps
  tableName: 'EmailTracking', // Explicit table name for clarity
});

export default EmailTracking;
