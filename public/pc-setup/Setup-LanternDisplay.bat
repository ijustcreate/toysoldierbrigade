@echo off
setlocal
cd /d "%~dp0"
PowerShell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-LanternDisplay.ps1"
if errorlevel 1 (
  echo.
  echo Lantern Display setup did not finish successfully.
  pause
)
endlocal
