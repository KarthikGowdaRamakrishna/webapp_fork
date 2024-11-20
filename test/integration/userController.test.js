import request from 'supertest';
import app from '../../src/app.js'; // Adjust the path to where your app instance is exported
import sequelize from '../../src/config/database.js'; // Adjust the path to your Sequelize configuration
import User from '../../src/models/User.js'; // Adjust the path to your User model
import bcrypt from 'bcrypt';

// Mocking Sequelize models and database calls
jest.mock('../../src/models/User.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn(),
}));

describe('User API Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database before running tests
  });

  beforeEach(async () => {
    // Clear mock call history
    User.create.mockClear();
    User.findOne.mockClear();
    User.destroy.mockClear();
    User.findOne.mockResolvedValue({
    id: '1',
    first_name: 'Test',
    last_name: 'User',
    email: 'user34@example.com',
    password: await bcrypt.hash('password123', 10), // Use bcrypt to hash the password for the mock user
    account_created: new Date().toISOString(),
    account_updated: new Date().toISOString(),
    save: jest.fn().mockResolvedValue(true), // Mock save method to simulate updating the user
    });
  });

    // Test suite for creating a new user
    describe('POST /v1/user', () => {
      
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/v1/user').send({ email: 'test@example.com' }).expect(400);

      expect(response.body).toHaveProperty('error', 'All fields are required.');
    });

    it('should return 400 if email is already in use', async () => {
      // Mocking the User.findOne method to simulate an existing user
      User.findOne.mockResolvedValue({ email: 'user@example.com' });

      const response = await request(app)
        .post('/v1/user')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'user@example.com', // Existing email
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already in use.');
      expect(User.findOne).toHaveBeenCalledTimes(1);
    });
  });

  // Test suite for getting user information
  describe('GET /v1/user/self', () => {
    // it('should return user information when authenticated', async () => {
    //   // Mocking the User.findOne method to simulate an existing user
    //   User.findOne.mockResolvedValue({
    //     id: '1',
    //     first_name: 'Test',
    //     last_name: 'User',
    //     email: 'user@example.com',
    //     password: await bcrypt.hash('password123', 10),
    //     account_created: new Date().toISOString(),
    //     account_updated: new Date().toISOString(),
    //   });

    //   const response = await request(app).get('/v1/user/self').auth('user@example.com', 'password123').expect(200);

    //   expect(response.body).toHaveProperty('id');
    //   expect(response.body).toHaveProperty('first_name', 'Test');
    //   expect(response.body).toHaveProperty('last_name', 'User');
    //   expect(response.body).toHaveProperty('email', 'user@example.com');
    // });

    it('should return 401 if authentication fails', async () => {
      // Mocking the User.findOne method to simulate an existing user
      User.findOne.mockResolvedValue({
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const response = await request(app).get('/v1/user/self').auth('user@example.com', 'wrongpassword').expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password.');
    });

    it('should return 400 if user is not found', async () => {
      // Mocking the User.findOne method to simulate a non-existing user
      User.findOne.mockResolvedValue(null);

      const response = await request(app).get('/v1/user/self').auth('nontent@example.com', 'password123').expect(400);

      expect(response.body).toHaveProperty('error', "That's a bad Request: No such email in Our Database");
    });
  });

  // Test suite for updating user information
  describe('PUT /v1/user/self', () => {
    // it('should update user information when authenticated', async () => {
      


    //   const response = await request(app)
    //     .put('/v1/user/self')
    //     .auth('user@example.com', 'password123')
    //     .send({ first_name: 'Jane', last_name: 'Doe', password: 'newpassword123' })
    //     .expect(204);

    //   expect(response.body).toEqual({}); // 204 No Content response has an empty body
    // });

    // it('should return 400 if trying to update unsupported fields', async () => {
    //   const response = await request(app)
    //     .put('/v1/user/self')
    //     .auth('user@example.com', 'password123')
    //     .send({ email: 'new.email@example.com' }) // Unsupported field
    //     .expect(400);

    //   expect(response.body).toHaveProperty('error', 'Cannot update fields: email');
    // });

    it('should return 400 if user is not found', async () => {
      // Mocking the User.findOne method to simulate a non-existing user
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/v1/user/self')
        .auth('nontent@example.com', 'password123')
        .send({ first_name: 'Jane' })
        .expect(400);

      expect(response.body).toHaveProperty('error', "That's a bad Request: No such email in Our Database");
    });
  });
});


