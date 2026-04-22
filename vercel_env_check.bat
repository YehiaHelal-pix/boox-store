@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"
echo === Checking Vercel env vars ===
npx vercel env ls production 2>&1
echo.
echo === Done ===
