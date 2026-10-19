@echo off
setlocal
cd /d "%~dp0"
title Setup Raajamani Billing System

echo =======================================================
echo       Setting up Raajamani Billing System
echo =======================================================
echo.

:: 1. Check if Python is installed
set PY_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PY_CMD=py
    ) else (
        echo [ERROR] Python is not installed or not added to PATH.
        echo Please download and install Python from https://www.python.org/downloads/
        echo IMPORTANT: Make sure to check the box "Add Python to PATH" during installation!
        echo.
        pause
        exit /b 1
    )
)

echo [1/3] Python detected:
%PY_CMD% --version
echo.

:: 2. Install required Python packages
echo [2/3] Installing billing engine dependencies...
%PY_CMD% -m pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    echo [RETRYING] Installing core packages directly...
    %PY_CMD% -m pip install fastapi "uvicorn[standard]" SQLAlchemy python-dotenv python-multipart pydantic
)
echo.

:: Verify package installation
echo Verifying installed modules...
%PY_CMD% -c "import fastapi, uvicorn, sqlalchemy; print('Packages verified successfully!')"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python modules failed to verify. Please check internet connection.
    pause
    exit /b 1
)
echo.

:: 3. Create desktop shortcut
echo [3/3] Creating "Raajamani Billing" desktop shortcut icon...
powershell -ExecutionPolicy Bypass -File "%~dp0create-desktop-shortcut.ps1"
echo.

echo =======================================================
echo    Installation Complete!
echo    You can now close this window and double-click 
echo    "Raajamani Billing" on your Desktop to start!
echo =======================================================
echo.
pause
