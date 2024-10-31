import User from '../models/User.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';

export const createUser = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    const newUser = await User.create(userData);
    logger.info(`User created with ID: ${newUser.id}`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      logger.info(`User found with email: ${email}`);
    } else {
      logger.warn(`User not found with email: ${email}`);
    }
    return user;
  } catch (error) {
    logger.error('Error fetching user by email:', error);
    throw error;
  }
};

export const updateUser = async (email, updateData) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`User not found for update: ${email}`);
      return null;
    }

    if (updateData.first_name) user.first_name = updateData.first_name;
    if (updateData.last_name) user.last_name = updateData.last_name;
    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    user.account_updated = new Date();
    await user.save();
    logger.info(`User updated with email: ${email}`);
    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};
