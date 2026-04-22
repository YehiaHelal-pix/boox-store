@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"

echo === Manually aliasing latest deployment to production domain ===
npx vercel alias dpl_6RWoNxKCokb93B3wZEFphfo3eXA4 boox-store.vercel.app 2>&1

echo.
echo === Done ===
pause
