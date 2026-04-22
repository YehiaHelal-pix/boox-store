@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "VERCEL_TOKEN=vca_57DEBDjBhjcPIORFAB5GlyJ6VrYeuhgXf3INmoxSVj2eUbgasT1EZWGl"
curl -s -X PATCH ^
  -H "Authorization: Bearer %VERCEL_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"framework\":\"nextjs\",\"ssoProtection\":null,\"passwordProtection\":null}" ^
  "https://api.vercel.com/v9/projects/boox-store?teamId=yehia-mohamed-s-projects" ^
  > patch_result.json 2>&1
type patch_result.json
