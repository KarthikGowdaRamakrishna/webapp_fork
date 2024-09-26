const express = require('express');
const healthController = require('./Controllers/healthController');
const app = express();

// Middlewares
app.use(express.json());

// Health Check Route
app.get('/healthz', healthController.healthCheck);

// Handle unsupported methods for /healthz
app.all('/healthz', healthController.methodNotAllowed);



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
