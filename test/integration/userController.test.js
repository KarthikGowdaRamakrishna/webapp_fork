import request from "supertest";
import app from "../../src/app"; // Import app instance
import User from "../../src/models/User.js"; // Import User model
import sequelize from "../../src/config/database"; // Import Sequelize instance
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import { statsdClient } from "../../src/config/statsd.js"; // Import StatsD client

// Mock dependencies
jest.mock("../../src/models/User.js"); // Mock the User model
jest.mock("../../src/config/statsd.js", () => ({
  statsdClient: {
    increment: jest.fn(),
    timing: jest.fn(),
    close: jest.fn(),
  },
}));
jest.mock("../../src/utils/monitoringUtils.js", () => ({
  sendMetricToCloudWatch: jest.fn().mockResolvedValue(),
}));

describe("User API Endpoints", () => {
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset database before running tests
    await sequelize.authenticate(); // Ensure connection works
  });

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks before each test

    // Set up a mock user for tests
    testUser = {
      id: 1,
      first_name: "Test",
      last_name: "User",
      email: "user@example.com",
      password: await bcrypt.hash("password123", 10),
      get: jest.fn().mockReturnValue({
        id: 1,
        first_name: "Test",
        last_name: "User",
        email: "user@example.com",
      }),
      save: jest.fn().mockResolvedValue(),
    };

    // Mock User model methods
    User.create.mockResolvedValue(testUser);
    User.findByPk.mockResolvedValue(testUser);
    User.findOne.mockResolvedValue(testUser);
  });

  afterAll(async () => {
    statsdClient.close(); // Close StatsD client
    await sequelize.close(); // Properly close Sequelize connection
  });

  describe("POST /v1/user", () => {
    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/v1/user")
        .send({ email: "test@example.com" }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty("error", "All fields are required.");
    });
  });

  describe("GET /v1/user/self", () => {
    it("should return 401 if authentication fails", async () => {
      const response = await request(app)
        .get("/v1/user/self")
        .auth("user@example.com", "wrongpassword") // Incorrect password
        .expect(401);

      expect(response.body).toHaveProperty("error", "Invalid email or password.");
    });
  });

  describe("PUT /v1/user/self", () => {
    it("should return 400 if user does not exist", async () => {
      User.findOne.mockResolvedValue(null); // Simulate user not found

      const response = await request(app)
        .put("/v1/user/self")
        .auth("nonexistent@example.com", "password123") // Non-existent user
        .send({ first_name: "Updated" }) // Update attempt
        .expect(400);

      expect(response.body).toHaveProperty("error", "That's a bad Request: No such email in Our Database");
    });
  });
});
