// server.js
import express from 'express';
import { healthCheck, methodNotAllowed } from './Controllers/healthController.js';
import { createUser, getUserInfo, updateUser } from './Controllers/userController.js'; // Import the named exports
import authenticateUser from './middleware/basicAuth.js';

const app = express();
app.use(express.json());

// Define routes
app.use('/v1/user/self', authenticateUser, (req, res, next) => {
  if (["DELETE", "HEAD", "OPTIONS", "PATCH"].includes(req.method)) {
    return res.status(405).end();
  } 
  next();
});

app.post('/v1/user', createUser);
app.get('/v1/user/self', authenticateUser, getUserInfo);
app.put('/v1/user/self', authenticateUser, updateUser);

app.get('/healthz', healthCheck);
app.head('/healthz', methodNotAllowed);
app.all('/healthz', methodNotAllowed);

// Export the app instance for testing
export default app;
