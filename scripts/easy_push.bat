@echo off

REM Add all changes
git add .

REM Commit changes
set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"

REM Push changes
git push origin main
