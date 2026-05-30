# Minux RTOS Control Center - Build Script
# PowerShell script for building the Minux RTOS Control Center

param(
    [string]$Compiler = "auto",
    [string]$Configuration = "Release",
    [switch]$Clean,
    [switch]$Verbose,
    [switch]$Help
)

# Display help
if ($Help) {
    Write-Host "Minux RTOS Control Center Build Script" -ForegroundColor Cyan
    Write-Host "Usage: .\build.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Compiler <auto|vs|mingw|clang>  Specify compiler (default: auto)"
    Write-Host "  -Configuration <Release|Debug>   Build configuration (default: Release)"
    Write-Host "  -Clean                          Clean before building"
    Write-Host "  -Verbose                        Verbose output"
    Write-Host "  -Help                           Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\build.ps1                     # Auto-detect compiler and build"
    Write-Host "  .\build.ps1 -Compiler mingw     # Use MinGW compiler"
    Write-Host "  .\build.ps1 -Clean              # Clean and build"
    exit 0
}

Write-Host "Minux RTOS Control Center - Build System" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "rtos\rtos.cpp")) {
    Write-Host "Error: rtos\rtos.cpp not found. Please run from the project root directory." -ForegroundColor Red
    exit 1
}

# Create build directory
if (!(Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
    Write-Host "Created build directory" -ForegroundColor Green
}

# Clean if requested
if ($Clean) {
    Write-Host "Cleaning build directory..." -ForegroundColor Yellow
    Remove-Item "build\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Build directory cleaned" -ForegroundColor Green
}

# Auto-detect compiler if not specified
if ($Compiler -eq "auto") {
    Write-Host "Auto-detecting compiler..." -ForegroundColor Yellow
    
    # Check for Visual Studio
    $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vsWhere) {
        $vsPath = & $vsWhere -latest -property installationPath
        if ($vsPath) {
            $vcvarsPath = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"
            if (Test-Path $vcvarsPath) {
                $Compiler = "vs"
                Write-Host "Found Visual Studio at: $vsPath" -ForegroundColor Green
            }
        }
    }
    
    # Check for MinGW if VS not found
    if ($Compiler -eq "auto") {
        try {
            $mingwVersion = & g++ --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                $Compiler = "mingw"
                Write-Host "Found MinGW GCC compiler" -ForegroundColor Green
            }
        } catch {
            # MinGW not found
        }
    }
    
    # Check for Clang if others not found
    if ($Compiler -eq "auto") {
        try {
            $clangVersion = & clang++ --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                $Compiler = "clang"
                Write-Host "Found Clang compiler" -ForegroundColor Green
            }
        } catch {
            # Clang not found
        }
    }
    
    if ($Compiler -eq "auto") {
        Write-Host "Error: No suitable compiler found!" -ForegroundColor Red
        Write-Host "Please install one of the following:" -ForegroundColor Yellow
        Write-Host "  - Visual Studio 2019/2022 with C++ tools"
        Write-Host "  - MinGW-w64 (https://winlibs.com/)"
        Write-Host "  - Clang with MSVC-compatible driver"
        exit 1
    }
}

Write-Host "Using compiler: $Compiler" -ForegroundColor Green
Write-Host "Configuration: $Configuration" -ForegroundColor Green

# The buildable app lives in the rtos\ project (rtos.cpp + minux_system.cpp + rtos.rc).
# The root main.cpp / minux_system.cpp set does NOT compile, so it is intentionally unused.
$sourceFiles = @("rtos\rtos.cpp", "rtos\minux_system.cpp")

# Verify source files exist
foreach ($file in $sourceFiles) {
    if (!(Test-Path $file)) {
        Write-Host "Error: Source file '$file' not found!" -ForegroundColor Red
        exit 1
    }
}

# Build based on compiler
$buildSuccess = $false

switch ($Compiler) {
    "vs" {
        Write-Host "Building with Visual Studio..." -ForegroundColor Yellow
        
        # Check for solution file
        if (Test-Path "windows.minux.io.sln") {
            # msbuild is usually NOT on PATH outside the Developer prompt; resolve it via vswhere.
            $msbuildCmd = "msbuild"
            $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
            if (Test-Path $vsWhere) {
                $found = & $vsWhere -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" |
                         Select-Object -First 1
                if ($found) { $msbuildCmd = $found }
            }

            $msbuildArgs = @(
                "windows.minux.io.sln",
                "/p:Configuration=$Configuration",
                "/p:Platform=x64",
                "/verbosity:minimal"
            )

            if ($Verbose) {
                $msbuildArgs[-1] = "/verbosity:normal"
            }

            Write-Host "Command: $msbuildCmd $($msbuildArgs -join ' ')" -ForegroundColor Gray
            & $msbuildCmd $msbuildArgs

            # MSBuild emits rtos.exe; copy it to the common build\ output and only then call it a success.
            $outputPath = "x64\$Configuration\rtos.exe"
            if (($LASTEXITCODE -eq 0) -and (Test-Path $outputPath)) {
                Copy-Item $outputPath "build\MinuxRTOS.exe" -Force
                Write-Host "Executable copied to build\MinuxRTOS.exe" -ForegroundColor Green
                $buildSuccess = $true
            }
        } else {
            Write-Host "Error: Visual Studio solution file not found!" -ForegroundColor Red
        }
    }
    
    "mingw" {
        Write-Host "Building with MinGW..." -ForegroundColor Yellow

        $opt     = if ($Configuration -eq "Debug") { @("-O0", "-g") } else { @("-O2") }
        $defines = @("-DUNICODE", "-D_UNICODE", "-DWINVER=0x0A00", "-D_WIN32_WINNT=0x0A00", "-DNOMINMAX")
        $libs    = @("-luser32", "-lgdi32", "-ldwmapi", "-lcomctl32", "-luxtheme", "-lshell32",
                     "-lpsapi", "-lpdh", "-liphlpapi", "-ladvapi32", "-lole32")

        # Build runs from inside rtos\ so the .rc's relative #includes and icon paths resolve.
        Push-Location "rtos"
        try {
            # rtos.rc is UTF-16; convert to a UTF-8 temp copy so windres (GNU binutils) can parse it.
            $rcText    = Get-Content "rtos.rc" -Raw -Encoding Unicode
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText((Join-Path (Get-Location) "rtos_utf8.rc"), $rcText, $utf8NoBom)

            Write-Host "Compiling resources (icon/menu/dialog)..." -ForegroundColor Gray
            & windres "rtos_utf8.rc" -O coff -o "..\build\rtos_res.o"
            $resExit = $LASTEXITCODE
            Remove-Item "rtos_utf8.rc" -Force -ErrorAction SilentlyContinue

            if ($resExit -ne 0) {
                Write-Host "Resource compilation failed (windres). Is it on PATH?" -ForegroundColor Red
            } else {
                # rtos.cpp uses wWinMain, so -municode is required (else 'undefined reference to WinMain').
                $gccArgs = @("-std=c++17") + $opt +
                    @("-municode", "-mwindows", "-static-libgcc", "-static-libstdc++") +
                    $defines +
                    @("rtos.cpp", "minux_system.cpp", "..\build\rtos_res.o", "-o", "..\build\MinuxRTOS.exe") +
                    $libs
                if ($Verbose) { $gccArgs = @("-v") + $gccArgs }

                Write-Host "Command: g++ $($gccArgs -join ' ')" -ForegroundColor Gray
                & g++ $gccArgs
                if ($LASTEXITCODE -eq 0) { $buildSuccess = $true }
            }
        } finally {
            Pop-Location
        }
    }

    "clang" {
        Write-Host "Building with Clang..." -ForegroundColor Yellow

        $opt     = if ($Configuration -eq "Debug") { @("-O0", "-g") } else { @("-O2") }
        $defines = @("-DUNICODE", "-D_UNICODE", "-DWINVER=0x0A00", "-D_WIN32_WINNT=0x0A00", "-DNOMINMAX")
        $libs    = @("-luser32", "-lgdi32", "-ldwmapi", "-lcomctl32", "-luxtheme", "-lshell32",
                     "-lpsapi", "-lpdh", "-liphlpapi", "-ladvapi32", "-lole32")

        # Targets the MinGW (windows-gnu) runtime so -municode / -mwindows / windres .o all apply,
        # matching the verified g++ path. Requires clang configured with a MinGW sysroot.
        Push-Location "rtos"
        try {
            $rcText    = Get-Content "rtos.rc" -Raw -Encoding Unicode
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText((Join-Path (Get-Location) "rtos_utf8.rc"), $rcText, $utf8NoBom)

            Write-Host "Compiling resources (icon/menu/dialog)..." -ForegroundColor Gray
            & windres "rtos_utf8.rc" -O coff -o "..\build\rtos_res.o"
            $resExit = $LASTEXITCODE
            Remove-Item "rtos_utf8.rc" -Force -ErrorAction SilentlyContinue

            if ($resExit -ne 0) {
                Write-Host "Resource compilation failed (windres). Is it on PATH?" -ForegroundColor Red
            } else {
                $clangArgs = @("-std=c++17") + $opt +
                    @("-target", "x86_64-pc-windows-gnu", "-municode", "-mwindows",
                      "-static-libgcc", "-static-libstdc++") +
                    $defines +
                    @("rtos.cpp", "minux_system.cpp", "..\build\rtos_res.o", "-o", "..\build\MinuxRTOS.exe") +
                    $libs
                if ($Verbose) { $clangArgs = @("-v") + $clangArgs }

                Write-Host "Command: clang++ $($clangArgs -join ' ')" -ForegroundColor Gray
                & clang++ $clangArgs
                if ($LASTEXITCODE -eq 0) { $buildSuccess = $true }
            }
        } finally {
            Pop-Location
        }
    }
    
    default {
        Write-Host "Error: Unknown compiler '$Compiler'" -ForegroundColor Red
        exit 1
    }
}

# Check build result
if ($buildSuccess) {
    Write-Host "" -ForegroundColor Green
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    
    if (Test-Path "build\MinuxRTOS.exe") {
        $fileInfo = Get-Item "build\MinuxRTOS.exe"
        Write-Host "Executable: build\MinuxRTOS.exe" -ForegroundColor White
        Write-Host "Size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor White
        Write-Host "Created: $($fileInfo.CreationTime)" -ForegroundColor White
        
        Write-Host ""
        Write-Host "You can now run the application with:" -ForegroundColor Yellow
        Write-Host "  .\build\MinuxRTOS.exe" -ForegroundColor Cyan
        
        # Ask if user wants to run the application
        $runApp = Read-Host "Do you want to run the application now? (y/N)"
        if ($runApp -eq "y" -or $runApp -eq "Y") {
            Write-Host "Starting Minux RTOS Control Center..." -ForegroundColor Green
            Start-Process "build\MinuxRTOS.exe"
        }
    }
} else {
    Write-Host "" -ForegroundColor Red
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host "=============" -ForegroundColor Red
    
    if ($Compiler -eq "mingw") {
        Write-Host ""
        Write-Host "Common MinGW issues and solutions:" -ForegroundColor Yellow
        Write-Host "  - Ensure MinGW-w64 is properly installed"
        Write-Host "  - Add MinGW bin directory to PATH"
        Write-Host "  - Try installing from: https://winlibs.com/"
    } elseif ($Compiler -eq "vs") {
        Write-Host ""
        Write-Host "Visual Studio build issues:" -ForegroundColor Yellow
        Write-Host "  - Ensure C++ build tools are installed"
        Write-Host "  - Try running from Developer Command Prompt"
        Write-Host "  - Check that Windows SDK is installed"
    }
    
    exit 1
}
