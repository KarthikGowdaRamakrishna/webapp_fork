import healthService from "../services/healthService.js";
import logger from "../utils/logger.js";

export const healthCheck = async (req, res) => {
  const allowedHeaders = [
    "user-agent", "accept", "postman-token", "host", "accept-encoding", "connection",
  ];

  try {
    const hasSomeHeaders = Object.keys(req.headers).some(
      (header) => !allowedHeaders.includes(header.toLowerCase())
    );

    if (
      Object.keys(req.body).length > 0 ||
      hasSomeHeaders ||
      Object.keys(req.query).length > 0 ||
      (req.files > 0 && Object.keys(req.files).length > 0)
    ) {
      res.setHeader('Cache-Control', 'no-cache');
      logger.warn('Invalid payload or headers in health check request');
      return res.status(400).end();
    }

    const isDatabaseConnected = await healthService();
    if (isDatabaseConnected) {
      logger.info('Database connection successful');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).end();
    } else {
      logger.error('Database connection failed');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(503).end();
    }
  } catch (err) {
    logger.error('Health check error:', err);
    res.status(503).end();
  }
};

export const methodNotAllowed = (req, res) => {
  logger.warn(`Method not allowed for path: ${req.path}`);
  res.status(405).end();
};
