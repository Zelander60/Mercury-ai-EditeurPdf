@echo off
REM pdf-book-build.bat — Full book builder (cover + content + merge)
REM Usage: pdf-book-build.bat <book.json> [output.pdf]

if "%~1"=="" (
    echo Usage: pdf-book-build.bat ^<book.json^> [output.pdf]
    exit /b 1
)

node "%~dp0build.js" %*
