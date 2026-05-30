@echo off
setlocal enabledelayedexpansion
echo Minux RTOS Control Center - Build Script
echo ========================================
echo.

REM The buildable app is the rtos\ project (rtos.cpp + minux_system.cpp + rtos.rc).
REM The root main.cpp set does NOT compile and is intentionally not used here.
REM
REM Usage:  build.bat            Build, then launch the app.
REM         build.bat /norun     Build only (for CI / scripts).

set "EXE=build\MinuxRTOS.exe"
set "RUN=1"
if /i "%~1"=="/norun" set "RUN=0"
if /i "%MINUX_NORUN%"=="1" set "RUN=0"

if not exist build mkdir build

REM ---- 1) Visual Studio --------------------------------------------------------
REM msbuild is usually NOT on PATH outside the Developer prompt; resolve it via vswhere.
set "MSBUILD="
where msbuild >nul 2>&1 && set "MSBUILD=msbuild"
if not defined MSBUILD (
    set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
    if exist "!VSWHERE!" (
        for /f "delims=" %%i in ('""!VSWHERE!" -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe"" 2^>nul') do set "MSBUILD=%%i"
    )
)
if defined MSBUILD (
    echo Found MSBuild: !MSBUILD!
    echo Building with Visual Studio ^(Release ^| x64^)...
    "!MSBUILD!" windows.minux.io.sln /p:Configuration=Release /p:Platform=x64 /verbosity:minimal /nologo
    if exist "x64\Release\rtos.exe" (
        copy /y "x64\Release\rtos.exe" "%EXE%" >nul
        echo Build successful -^> %EXE%
        goto :run
    )
    echo MSBuild did not produce an exe; falling back to a command-line compiler...
)

REM ---- 2) MinGW g++ ------------------------------------------------------------
REM If g++ isn't on PATH, add the WinLibs winget install (the toolchain this repo uses).
where g++ >nul 2>&1
if errorlevel 1 (
    for /d %%d in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\BrechtSanders.WinLibs*") do (
        if exist "%%d\mingw64\bin\g++.exe" set "PATH=%%d\mingw64\bin;!PATH!"
    )
)
where g++ >nul 2>&1
if !errorlevel!==0 (
    call :compile_gnu g++ ""
    if exist "%EXE%" goto :run
    goto :fail
)

REM ---- 3) Clang (windows-gnu target, matches the verified g++ path) ------------
where clang++ >nul 2>&1
if !errorlevel!==0 (
    call :compile_gnu clang++ "-target x86_64-pc-windows-gnu"
    if exist "%EXE%" goto :run
    goto :fail
)

echo.
echo No compatible compiler found!
echo Install one of:
echo   - Visual Studio 2019/2022/2026 with C++ tools
echo   - MinGW-w64   winget install BrechtSanders.WinLibs.POSIX.UCRT
echo   - Clang configured with a MinGW sysroot
echo.
echo Press any key to close...
pause >nul
goto :end

REM ============================================================================
:compile_gnu
REM %~1 = compiler exe, %~2 = extra target flags
echo Found %~1 - Building...
echo Converting resource script to UTF-8 for windres...
powershell -NoProfile -Command "$c = Get-Content 'rtos\rtos.rc' -Raw -Encoding Unicode; [System.IO.File]::WriteAllText((Join-Path (Get-Location) 'rtos\rtos_utf8.rc'), $c, (New-Object System.Text.UTF8Encoding($false)))"
pushd rtos
echo Compiling resources ^(icon/menu/dialog^)...
windres rtos_utf8.rc -O coff -o ..\build\rtos_res.o
del rtos_utf8.rc >nul 2>&1
REM rtos.cpp uses wWinMain, so -municode is required (else 'undefined reference to WinMain').
%~1 -std=c++17 -O2 %~2 -municode -mwindows -static-libgcc -static-libstdc++ ^
    -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 -DNOMINMAX ^
    rtos.cpp minux_system.cpp ..\build\rtos_res.o -o ..\build\MinuxRTOS.exe ^
    -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
    -lpsapi -lpdh -liphlpapi -ladvapi32 -lole32
popd
if exist "%EXE%" (
    echo Build successful -^> %EXE%
) else (
    echo Build failed with %~1
)
exit /b 0

REM ============================================================================
:fail
echo.
echo Build failed. See the compiler output above.
echo.
echo Press any key to close...
pause >nul
goto :end

:run
echo.
if "%RUN%"=="0" (
    echo Done. Run it with:  %EXE%
    goto :end
)
echo Launching %EXE% ...
start "" "%EXE%"

:end
endlocal
