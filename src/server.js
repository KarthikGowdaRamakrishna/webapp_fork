const express = require('express');
const healthController = require('./Controllers/healthController');
const userController = require('./Controllers/userController');
const app = express();

// Middlewares
app.use(express.json());

app.post('/v1/user', userController.createUser);

app.head('/healthz', healthController.methodNotAllowed);

// Health Check Route
app.get('/healthz', healthController.healthCheck);

// Handle unsupported methods for /healthz
app.all('/healthz', healthController.methodNotAllowed);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
