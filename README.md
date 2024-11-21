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



## Packer

packer init ./packer/aws.pkr.hcl  

packer build -var-file=./packer/dev.pkrvars.hcl ./packer/aws.pkr.hcl


##### create EC2 instance with this AMI image and the following command to check postgres is comaptable in the created instance 

# Get the latest AMI ID
        latest_ami=$(aws ec2 describe-images \
          --executable-users self \
          --filters "Name=state,Values=available" "Name=architecture,Values=x86_64" "Name=root-device-type,Values=ebs" \
          --query "reverse(sort_by(Images, &CreationDate))[0].ImageId" --output text)
        echo "Latest AMI ID: $latest_ami"

        # Get the latest launch template version
        latest_version=$(aws ec2 describe-launch-template-versions \
          --launch-template-id lt-0618ba0896499b77d \
          --query 'LaunchTemplateVersions[-1].VersionNumber' --output text)
        echo "Latest Launch Template Version: $latest_version"

        # Create a new launch template version
        aws ec2 create-launch-template-version \
          --launch-template-id lt-0618ba0896499b77d \
          --source-version $latest_version \
          --launch-template-data '{"ImageId":"'"$latest_ami"'"}'
        echo "Launch template updated with AMI ID: $latest_ami"

        # explicitly set the newly created version as the default
        new_version=$((latest_version+1))
        aws ec2 modify-launch-template \
          --launch-template-id lt-0618ba0896499b77d \
          --default-version $new_version
        echo "Updated launch template to default version $new_version"


        # Update the auto-scaling group to use the new launch template version
        aws autoscaling update-auto-scaling-group \
          --auto-scaling-group-name $asg_name \
          --launch-template "LaunchTemplateId=lt-0618ba0896499b77d,Version=$new_version"
        echo "Auto-scaling group updated with new launch template version"
