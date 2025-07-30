#!/bin/bash

# Test script for complex transform

# Install dependencies
yarn

# Install specific package
yarn lodash

# Install dev dependencies
yarn --save-dev jest

# Run tests
yarn test

# Run build
yarn build

# Start development server
yarn dev

# Add a package
yarn add express

# Remove a package
yarn remove lodash

# Run a custom script
yarn lint

# Check version
yarn --version

# Git operations
git switch -c feature-branch
git switch main

# Docker operations
echo "[INFO] Running: docker run nginx"
docker run nginx
echo "[INFO] Running: docker run -d redis"
docker run -d redis

# Kubernetes operations
echo "[INFO] Running: kubectl apply -f deployment.yaml"
kubectl apply -f deployment.yaml
echo "[INFO] Running: kubectl get pods"
kubectl get pods

# Terraform operations
echo "[INFO] Running: terraform init"
terraform init
echo "[INFO] Running: terraform plan"
terraform plan

# AWS operations
echo "[INFO] Running: aws s3 ls"
aws s3 ls
echo "[INFO] Running: aws ec2 describe-instances"
aws ec2 describe-instances

# Functions
function build() {
    set -e
    echo "Building..."
    yarn build
}

function test() {
    set -e
    echo "Testing..."
    yarn test
}

# Loops
for i in {1..5}; do
    set -e
    echo "Iteration $i"
done

while [ $i -lt 10 ]; do
    set -e
    echo "Count: $i"
    i=$((i+1))
done

# Variables
readonly API_KEY=secret123
readonly PASSWORD=password123
readonly TOKEN=abc123

# Complex conditionals
# Complex condition: "$OSTYPE" = "linux-gnu" ] && [ "$(uname -m)" = "x86_64" ] && [ "$(whoami)" = "root"
if [ "$OSTYPE" = "linux-gnu" ] && [ "$(uname -m)" = "x86_64" ] && [ "$(whoami)" = "root" ]; then
    echo "Running on Linux x86_64 as root"
else
    echo "Not running on Linux x86_64 as root"
fi

# Echo with format strings
printf "User: %s, Age: %d\n" "John" 25
printf "Status: %s\n" "OK"