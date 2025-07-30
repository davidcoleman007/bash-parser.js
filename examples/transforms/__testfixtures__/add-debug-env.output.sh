#!/bin/bash

# Test script for add-debug-env transform
DEBUG=true npm install lodash
DEBUG=true npm run build
DEBUG=true npm run test

# Commands with existing environment variables
NODE_ENV=production DEBUG=true npm run deploy
DEBUG=true npm run dev

# Non-npm commands should be unaffected
echo "hello world"
ls -la
cat package.json