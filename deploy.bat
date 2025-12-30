@echo off
cd /d %~dp0

echo Deploying application...

ssh www-data@jk.sk "rm -rf /var/www/sub.jk.sk/3d/*"
scp -r dist/* www-data@jk.sk:/var/www/sub.jk.sk/3d

echo.
echo Deployment complete.
