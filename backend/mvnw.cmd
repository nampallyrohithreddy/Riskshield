@REM ----------------------------------------------------------------------------
@REM RiskShield Maven Wrapper Shortcut
@REM ----------------------------------------------------------------------------
@echo off
set SCRIPT_DIR=%~dp0
set MAVEN_HOME=%SCRIPT_DIR%.tools\apache-maven-3.9.6
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    mvn %*
)
