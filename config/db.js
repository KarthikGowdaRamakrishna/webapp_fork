const Sequelize = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize instance with DB configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgresql',
    port: process.env.DB_PORT,
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to the database:', err));

module.exports = sequelize;
