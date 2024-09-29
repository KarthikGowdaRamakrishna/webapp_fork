const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createUser = async (userData) => {
  try {
    // Create the user in the database
    const user = await User.create(userData);
    // Remove the password from the response
    const { password, ...userWithoutPassword } = user.get({ plain: true });
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};
