import basicAuth from 'basic-auth';
import { getUserByEmail } from '../services/userService.js';
import bcrypt from 'bcrypt'; // Assuming passwords are hashed

// Middleware for Basic Authentication
const authenticateUser = async (req, res, next) => {
  const user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return res.status(401).json({ error: 'Unauthorized access. Please provide valid credentials.' });
  }

  try {
    // Log the email for debugging
    console.log('Authenticating user with email:', user.name);

    // Check if the user exists in the database
    const existingUser = await getUserByEmail(user.name); 

    if (!existingUser) {
      console.error('User not found in the database:', user.name);
      return res.status(400).json({ error: "That's a bad Request: No such email in Our Database" });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(user.pass, existingUser.password);
    if (!isPasswordValid) {
      console.error('Password mismatch for user:', user.name);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Attach user information to the request object
    req.user = existingUser;
    console.log('User authenticated successfully:', req.user);
    next(); // Pass control to the next middleware/route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'An error occurred during authentication.' });
  }
};
// Middleware for Blocking Unverified Users
const blockUnverifiedUsers = async (req, res, next) => {
  try {
    const user = req.user; // Assume `authenticateUser` already added user to req
    if (!user || !user.is_verified) {
      console.error('User is not verified:', user?.email || 'No user');
      return res.status(403).json({ error: 'Access denied. Please verify your email address.' });
    }
    next(); // Pass control to the next middleware/route handler
  } catch (error) {
    console.error('Error in blocking unverified user:', error);
    res.status(500).json({ error: 'Error occurred while processing the request.' });
  }
};

export { authenticateUser, blockUnverifiedUsers };
