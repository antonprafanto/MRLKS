@echo off
echo 🚀 Mobile Robotics Scoring - Railway Deployment
echo.

echo Step 1: Login to Railway...
echo Please run this command in a separate terminal:
echo railway login
echo.
pause

echo Step 2: Initialize Railway project...
railway init

echo Step 3: Add MySQL database...
echo railway add --database mysql
pause

echo Step 4: Deploy application...
railway up

echo.
echo ✅ Deployment completed!
echo Check your Railway dashboard for the live URL
pause