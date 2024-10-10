# CloudNativeAPI

This is a Node.js application using Express, Sequelize, and PostgreSQL.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).
- **NPM (Node Package Manager)**: Comes with Node.js installation.
- **PostgreSQL**: Install PostgreSQL from [PostgreSQL Official Website](https://www.postgresql.org/).
- **.env file**: Create a `.env` file in the root directory of your project with the following configurations:

```env
# PostgreSQL configurations
PG_DB_HOST=<your_postgres_host>
PG_DB_USER=<your_postgres_user>
PG_DB_PASSWORD=<your_postgres_password>
PG_DB_NAME=<your_postgres_database_name>

# Port for running the server
PORT=<your_preferred_port>
```

## Build and Deploy Instructions

### 1. Cloning the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Installing Dependencies

Before building the application, install all the dependencies listed in the `package.json` file:

```bash
npm install
```

### 3. Running the Application Locally

To run the application in development mode with `nodemon`:

```bash
npm run dev
```

To start the application in production mode:

```bash
npm start
```

### 4. Database Setup

Make sure your PostgreSQL server is running. Create the necessary databases using the provided `.env` configurations.

### 5. Testing the Application

To run the tests for your application:

```bash
npm test
```

## Continuous Integration (CI) with GitHub Actions

This repository uses **GitHub Actions** for Continuous Integration (CI). The CI workflow is automatically triggered on every pull request to the `main` branch and includes:

- **Node.js Setup**: The workflow runs the application on Node.js versions 16.x and 18.x to ensure compatibility.
- **Dependency Installation**: The CI workflow installs all dependencies using `npm install`.
- **PostgreSQL Setup**: PostgreSQL is installed and configured within the workflow to run integration tests.
- **Environment Variables**: CI uses environment variables from the repository secrets to configure the database.
- **Running Tests**: The workflow runs all tests defined in the application using `npm test`.

### GitHub Actions Workflow

The workflow configuration used in `.github/workflows/nodejs.yml`

### 6. Destroying the Infrastructure

After testing or deploying, you can clean up by stopping or removing any database resources or temporary files that may have been created during the test or deployment process.
