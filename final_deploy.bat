@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"
npx vercel --prod --force 2>&1
