const userService = require('../services/userService');

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
