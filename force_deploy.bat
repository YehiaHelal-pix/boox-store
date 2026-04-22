@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "E:\Boox Store"
set "VERCEL_TOKEN=vca_57DEBDjBhjcPIORFAB5GlyJ6VrYeuhgXf3INmoxSVj2eUbgasT1EZWGl"
npx vercel --prod --force --yes 2>&1
