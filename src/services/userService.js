// userService.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const createUser = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

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

export const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export const updateUser = async (email, updateData) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    if (updateData.first_name) user.first_name = updateData.first_name;
    if (updateData.last_name) user.last_name = updateData.last_name;
    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    user.account_updated = new Date();
    await user.save();

    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
