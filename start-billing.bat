@echo off
setlocal
cd /d "%~dp0"

:: Check if Python backend is already running on port 8000
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
    start "" /b python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
    :: Wait 2 seconds for server to initialize
    timeout /t 2 /nobreak >nul
)

:: Launch browser in dedicated Desktop App Mode (removes URL bar, tabs, and bookmarks)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://localhost:8000
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8000
) else (
    start http://localhost:8000
)
