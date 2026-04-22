@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
curl -s -H "Authorization: Bearer %VERCEL_TOKEN%" ^
  "https://api.vercel.com/v9/projects/boox-store?teamId=yehia-mohamed-s-projects" ^
  > project_info.json 2>&1
type project_info.json
