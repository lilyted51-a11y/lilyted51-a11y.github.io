@echo off
rem Start the local game server (no cache) and open the game in the browser.
rem Keep this window open while playing. Close it to stop.
cd /d "%~dp0"
python tools\serve.py 8000 --open
if errorlevel 9009 py tools\serve.py 8000 --open
pause
