@echo off
setlocal
cd /d "%~dp0"
title Raajamani Billing - Backend Server

echo ========================================================
echo        Starting Raajamani Billing Backend Server
echo ========================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not installed or not in PATH!
        echo Please install Python and check "Add Python to PATH".
        pause
        exit /b 1
    )
    set PY_CMD=py
) else (
    set PY_CMD=python
)

echo Using: %PY_CMD%
%PY_CMD% --version
echo.
echo Starting FastAPI on http://0.0.0.0:8000 ...
echo (Keep this window open while using the billing application)
echo.

%PY_CMD% -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo [ERROR] Backend failed to start.
    echo If a package is missing, run:
    echo   pip install fastapi "uvicorn[standard]" SQLAlchemy python-dotenv python-multipart
    echo ========================================================
    pause
)
