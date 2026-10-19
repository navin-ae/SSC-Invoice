@echo off
setlocal
title Stop Raajamani Billing System
echo Stopping Raajamani Billing server on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Server stopped.
timeout /t 1 /nobreak >nul
