@echo off
echo Minux RTOS Control Center - Build Script
echo ========================================
echo.

REM Check for Visual Studio Build Tools
where msbuild >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found MSBuild - Building with Visual Studio...
    msbuild windows.minux.io.sln /p:Configuration=Release /p:Platform=x64
    if %ERRORLEVEL%==0 (
        echo Build successful!
        copy "x64\Release\rtos.exe" "build\MinuxRTOS.exe" >nul 2>&1
        echo Executable copied to build\MinuxRTOS.exe
    ) else (
        echo Build failed with MSBuild
    )
    goto :end
)

REM Check for MinGW
where g++ >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found MinGW GCC - Building...
    if not exist build mkdir build
    g++ -std=c++17 -O2 -mwindows -static-libgcc -static-libstdc++ ^
        -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 ^
        -DWIN32_LEAN_AND_MEAN -DMINUX_VERSION="2.1.0" ^
        main.cpp minux_system.cpp -o build\MinuxRTOS.exe ^
        -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
        -lpsapi -lpdh -liphlpapi -ladvapi32
    if %ERRORLEVEL%==0 (
        echo Build successful!
        echo Executable: build\MinuxRTOS.exe
    ) else (
        echo Build failed with MinGW
    )
    goto :end
)

REM Check for Clang
where clang++ >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found Clang - Building...
    if not exist build mkdir build
    clang++ -std=c++17 -O2 -target x86_64-pc-windows-msvc ^
        -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 ^
        -DWIN32_LEAN_AND_MEAN -DMINUX_VERSION="2.1.0" ^
        main.cpp minux_system.cpp -o build\MinuxRTOS.exe ^
        -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
        -lpsapi -lpdh -liphlpapi -ladvapi32
    if %ERRORLEVEL%==0 (
        echo Build successful!
        echo Executable: build\MinuxRTOS.exe
    ) else (
        echo Build failed with Clang
    )
    goto :end
)

echo No compatible compiler found!
echo.
echo Please install one of the following:
echo   - Visual Studio 2019/2022 with C++ tools
echo   - MinGW-w64 (https://winlibs.com/)
echo   - Clang with MSVC-compatible driver
echo.

:end
echo.
echo Press any key to continue...
pause >nul
