# webapp
## CloudNativeAPI

This is a Node.js application using Express, Sequelize, MySQL, and PostgreSQL.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).
- **NPM (Node Package Manager)**: Comes with Node.js installation.
- **Database**:
  - **MySQL**: Ensure MySQL is installed and running. You can download it from [MySQL Official Website](https://www.mysql.com/).
  - **PostgreSQL**: Install PostgreSQL from [PostgreSQL Official Website](https://www.postgresql.org/).
- **.env file**: Create a `.env` file in the root directory of your project with the following configurations:

```env
# MySQL configurations
MYSQL_DB_HOST=<your_mysql_host>
MYSQL_DB_USER=<your_mysql_user>
MYSQL_DB_PASSWORD=<your_mysql_password>
MYSQL_DB_NAME=<your_mysql_database_name>

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

Make sure your MySQL and PostgreSQL servers are running. Create the necessary databases using the provided `.env` configurations.

### 5. Testing the Application

````bash
npm test

Test Run 1.2

