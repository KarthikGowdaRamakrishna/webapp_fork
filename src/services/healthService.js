const sequelize = require('../config/database.js');

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
  