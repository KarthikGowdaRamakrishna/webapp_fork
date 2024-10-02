const userService = require('../services/userService');
const User = require('../models/User')

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check for missing fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the email already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Create the user
    const newUser = await userService.createUser(req.body);

    // Construct the response in the desired order
    const response = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    // Assuming `req.user` contains the authenticated user's information, such as their email
    const userEmail = req.user.email;

    // Fetch the user from the database
    const user = await userService.getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Construct the response, excluding the password
    const response = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ error: 'An error occurred while fetching user information.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body; // Only capture fields that can be updated
    const allowedFields = ['first_name', 'last_name', 'password'];
    
    // Check if any unsupported fields are provided in the request
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = fieldsToUpdate.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Cannot update fields: ${invalidFields.join(', ')}` });
    }

    // Get the authenticated user's email from the request (set by `authenticateUser` middleware)
    const userEmail = req.user.email;

    // Update user information in the service layer
    const updatedUser = await userService.updateUser(userEmail, { first_name, last_name, password });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return 204 No Content for successful update
    res.status(204).end();
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body; // Only capture fields that can be updated
    const allowedFields = ['first_name', 'last_name', 'password'];
    
    // Check if any unsupported fields are provided in the request
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = fieldsToUpdate.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({ error: `Cannot update fields: ${invalidFields.join(', ')}` });
    }

    // Get the authenticated user's email from the request (set by `authenticateUser` middleware)
    const userEmail = req.user.email;

    // Update user information in the service layer
    const updatedUser = await userService.updateUser(userEmail, { first_name, last_name, password });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return 204 No Content for successful update
    res.status(204).end();
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};