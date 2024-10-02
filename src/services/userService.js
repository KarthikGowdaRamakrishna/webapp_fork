// Import the User model
const User = require('../models/User');

const bcrypt = require('bcrypt');

exports.createUser = async (userData) => {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Create the user in the database
    const newUser = await User.create(userData);
    return {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

exports.updateUser = async (email, updateData) => {
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    // Update fields only if provided and valid
    if (updateData.first_name) user.first_name = updateData.first_name;
    if (updateData.last_name) user.last_name = updateData.last_name;

    if (updateData.password) {
      // Hash the new password before saving
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update the account_updated timestamp
    user.account_updated = new Date();

    // Save the updated user data
    await user.save();

    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
