# Run this to start the frontend when node_modules is missing (e.g. in OneDrive)
# Uses the copy at C:\HRMS where npm install worked
Set-Location C:\HRMS\frontend
Write-Host "Starting Angular from C:\HRMS\frontend ..." -ForegroundColor Cyan
Write-Host "Open http://localhost:4200 when ready." -ForegroundColor Green
npm start
