@echo off
echo Minux RTOS Control Center - Visual Studio Build Script
echo ======================================================
echo.

REM Check for VsDevCmd.bat to set up environment
set "VSTOOLS="
for /f "delims=" %%i in ('dir "%ProgramFiles%\Microsoft Visual Studio" /s /b /a-d 2^>nul ^| findstr "VsDevCmd.bat"') do set "VSTOOLS=%%i"

if not "%VSTOOLS%"=="" (
    echo Found Visual Studio Developer Tools: %VSTOOLS%
    call "%VSTOOLS%"
    echo.
)

REM Try to build with MSBuild
echo Attempting to build Minux RTOS Control Center...
echo.

if exist "rtos.vcxproj" (
    msbuild rtos.vcxproj /p:Configuration=Release /p:Platform=x64 /v:minimal
    if %ERRORLEVEL%==0 (
        echo.
        echo ========================================
        echo Build completed successfully!
        echo ========================================
        echo.
        if exist "x64\Release\rtos.exe" (
            echo Executable: x64\Release\rtos.exe
            dir "x64\Release\rtos.exe"
            echo.
            echo You can now run the application:
            echo   x64\Release\rtos.exe
            echo.
            set /p run="Do you want to run the application now? (y/N): "
            if /i "!run!"=="y" (
                echo Starting Minux RTOS Control Center...
                start "" "x64\Release\rtos.exe"
            )
        )
    ) else (
        echo.
        echo ========================================
        echo Build failed!
        echo ========================================
        echo.
        echo Please check the error messages above.
        echo Make sure Visual Studio Build Tools are installed.
        echo.
    )
) else (
    echo Error: rtos.vcxproj not found!
    echo Please run this script from the rtos directory.
)

echo.
echo Press any key to continue...
pause >nul
