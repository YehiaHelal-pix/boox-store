@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "VERCEL_TOKEN=vca_57DEBDjBhjcPIORFAB5GlyJ6VrYeuhgXf3INmoxSVj2eUbgasT1EZWGl"
echo Fetching API response...
curl -s -H "Authorization: Bearer %VERCEL_TOKEN%" "https://api.vercel.com/v9/projects/boox-store?teamId=team_g0HxEd5OD4PQ2cmS2NoMNbAB" > api_response.json
echo Parsing settings...
node parse_api.js
