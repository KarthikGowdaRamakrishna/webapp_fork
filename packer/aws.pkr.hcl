packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Define variables
variable "aws_profile" {
  type = string
}

variable "aws_region" {
  description = "AWS region where the AMI will be created"
  type        = string
}

variable "aws_instance_type" {
  description = "Instance type to use for building the AMI"
  type        = string
}

variable "aws_source_ami" {
  description = "Source AMI to use for building the custom image"
  type        = string
}

variable "aws_vpc_id" {
  description = "VPC ID where the build instance will run"
  type        = string
}

variable "aws_subnet_id" {
  description = "Subnet ID within the VPC where the build instance will run"
  type        = string
}

variable "volume_size" {
  description = "Size of the root volume in GB"
  type        = number
}

# Define the source for AWS Amazon AMI
source "amazon-ebs" "ubuntu" {
  profile       = var.aws_profile
  region        = var.aws_region
  ami_name      = "ubuntu-24.04-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  instance_type = var.aws_instance_type
  vpc_id        = var.aws_vpc_id
  subnet_id     = var.aws_subnet_id

  # Use the latest Ubuntu 24.04 LTS AMI
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"] # Canonical ID for Ubuntu
  }

  ssh_username = "ubuntu"

  ami_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = var.volume_size
    delete_on_termination = true
    volume_type           = "gp2"
  }
}

# Build section with provisioners
build {
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  # Check if webapp.zip exists before provisioning
  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  # Provision the systemd service file
  provisioner "file" {
    source      = "./packer/csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  # Use sudo to move the service file to systemd directory and reload systemd daemon
  provisioner "shell" {
    inline = [
      "sudo mv /tmp/csye6225.service /etc/systemd/system/csye6225.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable csye6225.service"
    ]
  }

  # Update and upgrade the OS
  provisioner "shell" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y"
    ]
  }

  # Create user and group for the application
  provisioner "shell" {
    inline = [
      "if ! getent group csye6225 > /dev/null 2>&1; then sudo groupadd csye6225; fi",
      "if ! id -u csye6225 > /dev/null 2>&1; then sudo useradd -m -g csye6225 csye6225; fi"
    ]
  }

  # Install Node.js and npm
  provisioner "shell" {
    inline = [
      "curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -",
      "sudo apt-get install -y nodejs"
    ]
  }

  # Add PostgreSQL APT repository and install PostgreSQL
  provisioner "shell" {
    inline = [
      "sudo sh -c 'echo \"deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main\" > /etc/apt/sources.list.d/pgdg.list'",
      "wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -",
      "sudo apt-get update",
      "sudo apt-get install -y postgresql postgresql-contrib",
      "sudo systemctl enable postgresql",
      "sudo systemctl start postgresql"
    ]
  }

  # Set up and start the web application
  provisioner "shell" {
    inline = [
      "sudo apt-get install -y unzip",
      "sudo mkdir -p /opt/applications/webapp", 
      "sudo unzip /tmp/webapp.zip -d /opt/applications/webapp",
      "echo unzipping-1",
      "sudo chown -R csye6225:csye6225 /opt/applications/webapp",
      "echo access-2",
      "ls -la /opt/applications/webapp",
      "echo listing done",
      "sudo systemctl enable csye6225.service",
      "echo system enabling",
      "sudo systemctl start csye6225.service",
      "sudo systemctl status csye6225"

      
    ]
  }
}
