@echo off
echo Adding files...
git add src/app/debug/page.tsx src/app/simple-test/page.tsx src/app/admin/test-dashboard/page.tsx src/middleware.ts

echo Committing changes...
git commit -m "Fix debug page and add test pages"

echo Pushing to master...
git push origin master

echo Done!
pause

