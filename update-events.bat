@echo off
echo.
echo ========================================
echo    Event Date Update Tool
echo ========================================
echo.
echo This will check event websites for updated dates
echo and automatically update your events data.
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting event date update process...
echo.

node update-event-dates.js

echo.
echo ========================================
echo    Process Complete!
echo ========================================
echo.
echo Check the output above for results.
echo If dates were updated, restart your dev server.
echo.
pause
