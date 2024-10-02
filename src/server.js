const express = require('express');
const healthController = require('./Controllers/healthController');
const userController = require('./Controllers/userController');
const authenticateUser = require('./middleware/basicAuth'); 
const basicAuth = require('../src/middleware/basicAuth');

const app = express();
const routes = express.Router();


// Debugging logs to verify imports
console.log('UserController:', userController);
console.log('AuthenticateUser:', authenticateUser);
console.log('HealthController:', healthController);

// Middlewares
app.use(express.json());

try {
  app.use('/v1/user/self', basicAuth, (req, res, next) => {
    if (["DELETE", "HEAD", "OPTIONS", "PATCH"].includes(req.method)) {
      return res.status(405).end();
    } 
    next();
  });
  app.post('/v1/user', userController.createUser);
  app.get('/v1/user/self', authenticateUser, userController.getUserInfo);
} catch (error) {
  console.error('Error setting up routes:', error);
}

app.put('/v1/user/self', authenticateUser, userController.updateUser);

app.head('/healthz', healthController.methodNotAllowed);
// Health Check Route
app.get('/healthz', healthController.healthCheck);

// Handle unsupported methods for /healthz
app.all('/healthz', healthController.methodNotAllowed);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
