@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"
npx vercel logs https://boox-store.vercel.app --output raw 2>&1
