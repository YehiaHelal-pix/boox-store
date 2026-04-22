@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
cd /d "E:\Boox Store"

echo === Using project: prj_Rr5Ik0IGaUDydzK0wYjc8QSBAGWf ===

REM Get Vercel token from global config
SET TOKEN_FILE=%USERPROFILE%\.local\share\com.vercel.cli\auth.json
IF NOT EXIST "%TOKEN_FILE%" SET TOKEN_FILE=%APPDATA%\com.vercel.cli\auth.json
IF NOT EXIST "%TOKEN_FILE%" SET TOKEN_FILE=%USERPROFILE%\.config\com.vercel.cli\auth.json

echo Looking for token at: %TOKEN_FILE%
type "%TOKEN_FILE%" 2>nul

echo.
echo === Running Node setup script ===
node vercel_setup.mjs
EXIT /B %ERRORLEVEL%
