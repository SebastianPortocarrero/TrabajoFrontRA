#!/bin/bash

# Start the frontend in development mode
echo "Starting Frontend application..."

cd BOLT

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please configure your .env file if needed"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend development server..."
npm run dev