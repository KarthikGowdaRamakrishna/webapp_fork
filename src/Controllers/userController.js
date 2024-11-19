import { createUser as createUserService, getUserByEmail, updateUser as updateUserService } from '../services/userService.js';
import logger from '../utils/logger.js';
import EmailTracking from '../models/EmailTracking.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import AWS from 'aws-sdk';

const allowedHeaders = [
  'content-type', 'accept', 'user-agent', 'host', 'content-length',
  'accept-encoding', 'connection', 'authorization', 'postman-token',
  'x-forwarded-for', 'x-forwarded-proto', 'x-amzn-trace-id', 'x-forwarded-Port'
];

// Configure AWS SNS (no region explicitly set here)
const sns = new AWS.SNS({
  region: process.env.AWS_REGION || 'us-east-1', // Replace 'us-east-1' with your default region
});
export const createUser = async (req, res) => {
  logger.info('Incoming headers:', req.headers);
  try {
    const hasUnexpectedHeaders = Object.keys(req.headers).some(
      (header) => !allowedHeaders.includes(header.toLowerCase()) && !header.toLowerCase().startsWith('x-')
    );

    if (hasUnexpectedHeaders) {
      logger.warn('Unexpected headers detected in request');
      return res.status(400).json({ message: 'Unexpected headers in the request.' });
    }

    const { first_name, last_name, email, password } = req.body;

    // Validate input fields
    if (!first_name || !last_name || !email || !password) {
      logger.warn('Missing fields in user creation request');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.warn(`Attempt to create a user with an existing email: ${email}`);
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Step 1: Create the user
    const newUser = await createUserService(req.body);
    logger.info(`User created successfully: ${newUser.id}`);

    // Step 2: Publish message to SNS
    const message = JSON.stringify({ email, userId: newUser.id });
    const params = {
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN, // Ensure SNS_TOPIC_ARN is in .env
    };

    try {
      await sns.publish(params).promise();
      logger.info(`Verification email request sent to SNS for user: ${email}`);
    } catch (snsError) {
      logger.error(`Failed to publish verification message for user: ${email}`, snsError);
      return res.status(500).json({ error: 'Failed to send verification email.' });
    }

    // Step 3: Respond with success
    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating the user.' });
  }
};


export const getUserInfo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      logger.warn('User not found in request');
      return res.status(404).json({ error: 'User not found.' });
    }

    logger.info(`User information retrieved for user ID: ${user.id}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user information:', error);
    res.status(500).json({ error: 'An error occurred while fetching user information.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;
    const allowedFields = ['first_name', 'last_name', 'password'];

    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = fieldsToUpdate.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      logger.warn(`Invalid fields in update request: ${invalidFields.join(', ')}`);
      return res.status(400).json({ error: `Cannot update fields: ${invalidFields.join(', ')}` });
    }

    const userEmail = req.user.email;
    const updatedUser = await updateUserService(userEmail, { first_name, last_name, password });

    if (!updatedUser) {
      logger.warn(`User not found for update: ${userEmail}`);
      return res.status(404).json({ error: 'User not found.' });
    }

    logger.info(`User updated successfully for email: ${userEmail}`);
    res.status(204).end();
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }
};
