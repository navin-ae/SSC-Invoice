@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Raajamani Billing Launcher

:: 1. Detect Python command
set PY_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PY_CMD=py
    ) else (
        echo [ERROR] Python not found in system PATH.
        echo Please install Python from https://www.python.org/
        pause
        exit /b 1
    )
)

:: 2. Check if Backend is already answering on port 8000
curl.exe -s http://127.0.0.1:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Raajamani Billing engine...
    start "Raajamani Billing Backend" /min %PY_CMD% -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
    
    :: Wait until backend is genuinely ready (max 12 seconds)
    set READY=0
    for /l %%i in (1,1,12) do (
        if !READY! equ 0 (
            timeout /t 1 /nobreak >nul
            curl.exe -s http://127.0.0.1:8000/health >nul 2>&1
            if !errorlevel! equ 0 (
                set READY=1
            )
        )
    )
    
    if !READY! equ 0 (
        echo.
        echo [WARNING] Backend is taking longer than usual to start.
        echo Attempting to open browser anyway...
    )
)

:: 3. Open in dedicated clean App Window (removes address bar, bookmarks, tabs)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8000
) else (
    start http://localhost:8000
)

exit /b 0
