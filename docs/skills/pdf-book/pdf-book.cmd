@echo off
setlocal
set "ENGINE_DIR=%~dp0"
if "%~1"=="" (
  echo Usage: pdf-book.cmd ^<book.json^> [output.pdf]
  exit /b 1
)
if "%~2"=="" (
  node "%ENGINE_DIR%engine.js" "%~1" "%~dp0output.pdf"
) else (
  node "%ENGINE_DIR%engine.js" "%~1" "%~2"
)
exit /b %ERRORLEVEL%
