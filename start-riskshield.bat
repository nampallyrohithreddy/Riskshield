@echo off
echo ========================================================
echo        STARTING RISKSHIELD FRAUD PREVENTION STACK       
echo ========================================================
echo.
echo [1/2] Launching Backend Gateway on port 8080...
start "RiskShield Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo [2/2] Launching Frontend SOC Dashboard on port 3000...
start "RiskShield Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Waiting 5 seconds for dev servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo RiskShield is now running! 
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo ========================================================
pause
