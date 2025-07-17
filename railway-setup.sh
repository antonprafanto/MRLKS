#!/bin/bash

# Railway Database Setup Script
echo "🚀 Setting up database for Railway deployment..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 10

# Run database setup
echo "📊 Setting up database schema and data..."
npm run setup-db

echo "✅ Railway setup completed!"
echo "🌐 Your Mobile Robotics Scoring System is ready!"

# Check if setup was successful
if [ $? -eq 0 ]; then
    echo "✅ Database setup successful!"
    echo "📱 Access your app at the Railway domain"
else
    echo "❌ Database setup failed. Check logs for details."
    exit 1
fi