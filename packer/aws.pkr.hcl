packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Define variables for AWS and database configurations
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

# Database configuration variables (from secrets)
variable "DB_USER" {
  type = string
}

variable "DB_PASSWORD" {
  type = string
}

variable "DB_NAME" {
  type = string
}

variable "DB_PORT" {
  type = string
}

variable "aws_dev_user" {
  description = "AWS Account ID for the dev account where the AMI will be created"
  type        = string
}

variable "aws_demo_user" {
  description = "AWS Account ID for the demo account where the AMI should be shared."
  type        = string
}

# Define the source for AWS Amazon AMI
source "amazon-ebs" "ubuntu" {
  profile       = var.aws_profile
  region        = var.aws_region
  ami_name      = "ubuntuAWS-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  instance_type = var.aws_instance_type
  vpc_id        = var.aws_vpc_id
  subnet_id     = var.aws_subnet_id
  ami_users     = [var.aws_dev_user, var.aws_demo_user]

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

  # Upload webapp.zip
  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  # Provision systemd service file
  provisioner "file" {
    source      = "./packer/csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  # Upload CloudWatch agent configuration file
  # provisioner "file" {
  #   source      = "./packer/cloudwatch-agent-config.json"
  #   destination = "/tmp/cloudwatch-agent-config.json"
  # }

  # provisioner "file" {
  #   source      = "./.env"
  #   destination = "/tmp/.env"
  # }


  # Move service file and reload systemd daemon
  provisioner "shell" {
    inline = [
      "set -e",
      "sudo mv /tmp/csye6225.service /etc/systemd/system/csye6225.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable csye6225.service"
    ]
  }

  # Install Node.js, PostgreSQL, and unzip the webapp
  provisioner "shell" {
    inline = [
      "export DEBIAN_FRONTEND=noninteractive",
      "sudo apt-get clean",
      "sudo apt-get update -y && sudo apt-get upgrade -y",
      "sudo apt-get install -y unzip",
      "curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",
      "sudo groupadd csye6225",
      "sudo useradd -s /usr/sbin/nologin -g csye6225 -d /var/csye6225 -m csye6225",
      # "sudo apt-get install -y postgresql postgresql-contrib",
      # "sudo systemctl enable postgresql",
      # "sudo systemctl start postgresql",
      "sudo mkdir -p /var/applications/webapp",
      "echo test1",
      "sudo unzip /tmp/webapp.zip -d /var/applications/webapp",
      "sudo chown -R csye6225:csye6225 /var/applications/webapp",
      "echo test2",
      "sudo npm install --prefix /var/applications/webapp/"
    ]
  }

  # Install CloudWatch Agent and apply configuration
# Install CloudWatch Agent, configure, and start it
# provisioner "shell" {
#   inline = [
#     # Update system and install wget to download CloudWatch Agent
#     "sudo apt-get update -y && sudo apt-get install -y wget",
#     # Download the CloudWatch Agent from AWS's S3 bucket
#     "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
#     # Install the CloudWatch Agent
#     "sudo dpkg -i amazon-cloudwatch-agent.deb",
#     # Create the configuration directory for CloudWatch Agent
#     "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc",
#     # Move the CloudWatch Agent config file to the appropriate location
#     "sudo mv /tmp/amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
#     # Set ownership and permissions for the configuration file
#     "sudo chown root:root /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
#     "sudo chmod 644 /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
#     # Stop the CloudWatch Agent if it is running
#     "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop",
#     # Start the CloudWatch Agent with the specified configuration
#     "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s",
#     # Enable the CloudWatch Agent to start on boot
#     "sudo systemctl enable amazon-cloudwatch-agent"
#   ]
# }


# Install the Unified CloudWatch Agent
  provisioner "shell" {
    inline = [
      "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
      "rm amazon-cloudwatch-agent.deb"
    ]
  }
 
  # Copy CloudWatch Agent configuration file
  provisioner "file" {
    source      = "./packer/amazon-cloudwatch-agent.json"
    destination = "/tmp/amazon-cloudwatch-agent.json"
  }
 
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc",
      "ls -al /tmp"
      "sudo mv /tmp/amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
      "sudo chown root:root /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
      "sudo chmod 644 /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a start -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s",
      "sudo systemctl enable amazon-cloudwatch-agent"
      "sudo systemctl start amazon-cloudwatch-agent"
    ]
  }



  # Start the Node.js service
  provisioner "shell" {
    inline = [
      "sudo systemctl start csye6225.service",
      "sudo systemctl status csye6225.service"
    ]
  }
}
