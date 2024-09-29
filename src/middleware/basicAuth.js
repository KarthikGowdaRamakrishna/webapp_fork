const basicAuth = require('basic-auth');
const userService = require('../services/userService');
const bcrypt = require('bcrypt'); // Assuming passwords are hashed

// Middleware for Basic Authentication
const authenticateUser = async (req, res, next) => {
  const user = basicAuth(req);

  // If user credentials are not provided, return 401 Unauthorized
  if (!user || !user.name || !user.pass) {
    return res.status(401).json({ error: 'Unauthorized access. Please provide valid credentials.' });
  }

  try {
    // Check if the user exists in the database
    const existingUser = await userService.getUserByEmail(user.name);

    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if the password matches (assuming passwords are stored hashed)
    const isPasswordValid = await bcrypt.compare(user.pass, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Attach user information to the request object for further use
    req.user = existingUser;
    next(); // Pass control to the next middleware/route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'An error occurred during authentication.' });
  }
};

module.exports = authenticateUser;
