@echo off
title RiskShield Backend Gateway (Port 8080)
echo ===================================================
echo Starting RiskShield Spring Boot 3 Engine...
echo ===================================================
cd backend
call mvnw.cmd spring-boot:run
pause
