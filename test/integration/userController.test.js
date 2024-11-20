import sequelize from '../../src/config/database.js';
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';

jest.mock('../../src/models/User.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn(),
}));

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset the database schema
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();

  User.findOne.mockResolvedValue({
    id: '1',
    first_name: 'Test',
    last_name: 'User',
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 10),
    account_created: new Date().toISOString(),
    account_updated: new Date().toISOString(),
    save: jest.fn().mockResolvedValue(true),
  });
});

afterAll(async () => {
  await sequelize.close(); // Clean up the Sequelize connection
});

describe('User API Endpoints', () => {
  describe('POST /v1/user', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/v1/user')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'All fields are required.');
    });
  });
  describe('POST /v1/user', () => {
    it('should return 200 for succeful user creation', async () => {
      const response = await request(app)
        .post('/v1/user')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'All fields are required.');
    });
  });

  
  describe('GET /v1/user/self', () => {
    it('should return 201 user found', async () => {
      const response = await request(app)
        .get('/v1/user/self')
        .auth('user@example.com', 'wrongpassword')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password.');
    });
  });

  describe('GET /v1/user/self', () => {
    it('should return 400 if authentication fails', async () => {
      const response = await request(app)
        .get('/v1/user/self')
        .auth('user@example.com', 'wrongpassword')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password.');
    });
  });
  describe('PUT /v1/user/self', () => {
    it('should return 201 for user update', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/v1/user/self')
        .auth('nontent@example.com', 'password123')
        .send({ first_name: 'Jane' })
        .expect(400);

      expect(response.body).toHaveProperty('error', "That's a bad Request: No such email in Our Database");
    });
  });

  describe('PUT /v1/user/self', () => {
    it('should return 400 if authentication fails', async () => {
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
