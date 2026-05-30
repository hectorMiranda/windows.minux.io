@echo off
echo Minux RTOS Control Center - Build Script
echo ========================================
echo.

REM The buildable app is the rtos\ project (rtos.cpp + minux_system.cpp + rtos.rc).
REM The root main.cpp set does NOT compile and is intentionally not used here.

REM Check for Visual Studio Build Tools
where msbuild >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found MSBuild - Building with Visual Studio...
    if not exist build mkdir build
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

    echo Converting resource script to UTF-8 for windres...
    powershell -NoProfile -Command "$c = Get-Content 'rtos\rtos.rc' -Raw -Encoding Unicode; [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'rtos\rtos_utf8.rc'), $c, (New-Object System.Text.UTF8Encoding($false)))"

    pushd rtos
    echo Compiling resources (icon/menu/dialog)...
    windres rtos_utf8.rc -O coff -o ..\build\rtos_res.o
    del /q rtos_utf8.rc >nul 2>&1

    REM rtos.cpp uses wWinMain, so -municode is required (else 'undefined reference to WinMain').
    g++ -std=c++17 -O2 -municode -mwindows -static-libgcc -static-libstdc++ ^
        -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 -DNOMINMAX ^
        rtos.cpp minux_system.cpp ..\build\rtos_res.o -o ..\build\MinuxRTOS.exe ^
        -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
        -lpsapi -lpdh -liphlpapi -ladvapi32 -lole32
    popd

    if exist build\MinuxRTOS.exe (
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

    echo Converting resource script to UTF-8 for windres...
    powershell -NoProfile -Command "$c = Get-Content 'rtos\rtos.rc' -Raw -Encoding Unicode; [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'rtos\rtos_utf8.rc'), $c, (New-Object System.Text.UTF8Encoding($false)))"

    pushd rtos
    echo Compiling resources (icon/menu/dialog)...
    windres rtos_utf8.rc -O coff -o ..\build\rtos_res.o
    del /q rtos_utf8.rc >nul 2>&1

    REM Targets windows-gnu so -municode / windres .o match the verified g++ path.
    clang++ -std=c++17 -O2 -target x86_64-pc-windows-gnu -municode -mwindows ^
        -static-libgcc -static-libstdc++ ^
        -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 -DNOMINMAX ^
        rtos.cpp minux_system.cpp ..\build\rtos_res.o -o ..\build\MinuxRTOS.exe ^
        -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
        -lpsapi -lpdh -liphlpapi -ladvapi32 -lole32
    popd

    if exist build\MinuxRTOS.exe (
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
