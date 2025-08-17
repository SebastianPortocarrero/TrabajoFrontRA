#!/bin/bash

# Start the auth server in development mode
echo "Starting Better Auth server..."

cd api-backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please configure your .env file with the correct database and auth settings"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "Installing auth server dependencies..."
    npm install
fi

echo "Starting auth server on port 3002..."
npm run dev