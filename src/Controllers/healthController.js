import healthService from "../services/healthService.js";

export const healthCheck = async (req, res) => {
  const allowedHeaders = [
    "user-agent",
    "accept",
    "postman-token",
    "host",
    "accept-encoding",
    "connection",
  ];

  try {
    const hasSomeHeaders = Object.keys(req.headers).some(
      (header) => !allowedHeaders.includes(header.toLowerCase())
    );

    // Ensure no payload is sent in the request
    if (
      Object.keys(req.body).length > 0 ||
      hasSomeHeaders ||
      Object.keys(req.query).length > 0 ||
      (req.files > 0 && Object.keys(req.files).length > 0)
    ) {
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(400).end(); // Bad Request if any payload is present
    }
    // Check health status through the service layer
    const isDatabaseConnected = await healthService();

    if (isDatabaseConnected) {
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).end(); // Success
    } else {
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(503).end(); // Service Unavailable
    }
  } catch (err) {
    res.status(503).end();
  }
};

export const methodNotAllowed = (req, res) => {
  res.status(405).end(); // Method Not Allowed
};

