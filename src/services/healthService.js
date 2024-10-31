import sequelize from "../config/database.js";
import logger from "../utils/logger.js";

const healthService = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (err) {
    logger.error('Database connection failed:', err);
    return false;
  }
};

export default healthService;
