@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"

echo === Checking project info ===
npx vercel project ls 2>&1

echo.
echo === Checking alias for production deployment ===
npx vercel alias ls 2>&1

echo.
echo === Done ===
