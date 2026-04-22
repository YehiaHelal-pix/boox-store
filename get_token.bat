@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"

echo === Getting Vercel token from CLI config ===
for /f "tokens=*" %%a in ('npx vercel whoami --token 2^>^&1') do echo %%a

echo.
echo === Checking VERCEL_TOKEN env var ===
if defined VERCEL_TOKEN (
    echo VERCEL_TOKEN is set
) else (
    echo VERCEL_TOKEN is NOT set - will get from local auth
)

echo.
echo === Getting token from Vercel local config ===
type "%APPDATA%\com.vercel.cli\auth.json" 2>&1

echo.
