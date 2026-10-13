@echo off
title RiskShield SOC Dashboard (Port 3000)
echo ===================================================
echo Starting RiskShield React SOC Dashboard...
echo ===================================================
cd frontend
call npm.cmd run dev
pause
