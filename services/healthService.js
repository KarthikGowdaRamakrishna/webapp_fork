const sequelize = require('../config/db');

exports.checkDatabaseConnection = async () => {
    try {
      // Attempt to authenticate with the database
      await sequelize.authenticate();
      return true;  // Connection successful
    } catch (err) {
      console.error('Database connection failed:', err);  // Log the specific error
      return false;  // Connection failed
    }
  };
  