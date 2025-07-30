#!/bin/bash

# Test script for complex transform

# Install dependencies
npm install

# Install specific package
npm install lodash

# Install dev dependencies
npm install --save-dev jest

# Run tests
npm test

# Run build
npm run build

# Start development server
npm run dev

# Add a package
npm add express

# Remove a package
npm remove lodash

# Run a custom script
npm run lint

# Check version
npm --version

# Git operations
git checkout -b feature-branch
git checkout main

# Docker operations
docker run nginx
docker run -d redis

# Kubernetes operations
kubectl apply -f deployment.yaml
kubectl get pods

# Terraform operations
terraform init
terraform plan

# AWS operations
aws s3 ls
aws ec2 describe-instances

# Functions
function build() {
    echo "Building..."
    npm run build
}

function test() {
    echo "Testing..."
    npm test
}

# Loops
for i in {1..5}; do
    echo "Iteration $i"
done

while [ $i -lt 10 ]; do
    echo "Count: $i"
    i=$((i+1))
done

# Variables
API_KEY=secret123
PASSWORD=password123
TOKEN=abc123

# Complex conditionals
if [ "$OSTYPE" = "linux-gnu" ] && [ "$(uname -m)" = "x86_64" ] && [ "$(whoami)" = "root" ]; then
    echo "Running on Linux x86_64 as root"
else
    echo "Not running on Linux x86_64 as root"
fi

# Echo with format strings
echo "User: %s, Age: %d" "John" 25
echo "Status: %s" "OK"