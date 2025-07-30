#!/bin/bash

# Test script for add-debug-env transform
npm install lodash
npm run build
npm run test

# Commands with existing environment variables
NODE_ENV=production npm run deploy
DEBUG=true npm run dev

# Non-npm commands should be unaffected
echo "hello world"
ls -la
cat package.json