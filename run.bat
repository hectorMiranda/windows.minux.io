@echo off
setlocal
REM One-click run: build the app if it isn't built yet, then launch it.
REM   run.bat            Launch (build first only if needed).
REM   run.bat /rebuild   Force a fresh build, then launch.

REM Anchor every path to this script's folder so it works from any cwd.
cd /d "%~dp0"
set "EXE=%~dp0build\MinuxRTOS.exe"

if /i "%~1"=="/rebuild" (
    if exist "%EXE%" del "%EXE%" >nul 2>&1
)

if not exist "%EXE%" (
    echo Minux RTOS is not built yet - building it now...
    echo.
    call "%~dp0build.bat" /norun
    if not exist "%EXE%" (
        echo.
        echo Build did not produce %EXE%. See the output above.
        echo Press any key to close...
        pause >nul
        goto :eof
    )
)

echo Launching Minux RTOS Control Center...
start "Minux RTOS" "%EXE%"
endlocal
