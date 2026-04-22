@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "VERCEL_TOKEN=vca_57DEBDjBhjcPIORFAB5GlyJ6VrYeuhgXf3INmoxSVj2eUbgasT1EZWGl"
curl -s -H "Authorization: Bearer %VERCEL_TOKEN%" ^
  "https://api.vercel.com/v2/teams/yehia-mohamed-s-projects" ^
  > team_info.json 2>&1
type team_info.json
