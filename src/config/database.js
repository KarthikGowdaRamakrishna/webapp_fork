import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

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

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });  // This will create or update the table structure
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error syncing models with the database:', error);
  }
};

// Test the connection
sequelize.authenticate()
  .then(() => {
    syncDatabase();
    console.log('Database connected...')})
  .catch(err => console.error('Error connecting to the database:', err));

export default sequelize;