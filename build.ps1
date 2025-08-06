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
if (!(Test-Path "main.cpp")) {
    Write-Host "Error: main.cpp not found. Please run from the project root directory." -ForegroundColor Red
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

# Define common source files
$sourceFiles = @("main.cpp", "minux_system.cpp")
$headerFiles = @("minux_ui.h")

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
            $msbuildCmd = "msbuild"
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
            
            if ($LASTEXITCODE -eq 0) {
                $buildSuccess = $true
                $outputPath = "x64\$Configuration\rtos.exe"
                if (Test-Path $outputPath) {
                    Copy-Item $outputPath "build\MinuxRTOS.exe" -Force
                    Write-Host "Executable copied to build\MinuxRTOS.exe" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "Error: Visual Studio solution file not found!" -ForegroundColor Red
        }
    }
    
    "mingw" {
        Write-Host "Building with MinGW..." -ForegroundColor Yellow
        
        $gccCmd = "g++"
        $gccArgs = @(
            "-std=c++17",
            "-O2",
            "-mwindows",
            "-static-libgcc",
            "-static-libstdc++",
            "-DUNICODE",
            "-D_UNICODE", 
            "-DWINVER=0x0A00",
            "-D_WIN32_WINNT=0x0A00",
            "-DWIN32_LEAN_AND_MEAN",
            "-DMINUX_VERSION=`"2.1.0`"",
            $sourceFiles,
            "-o", "build\MinuxRTOS.exe",
            "-luser32", "-lgdi32", "-ldwmapi", "-lcomctl32", 
            "-luxtheme", "-lshell32", "-lpsapi", "-lpdh", 
            "-liphlpapi", "-ladvapi32"
        )
        
        if ($Configuration -eq "Debug") {
            $gccArgs = @("-g", "-O0") + $gccArgs[2..($gccArgs.Length-1)]
        }
        
        if ($Verbose) {
            $gccArgs = @("-v") + $gccArgs
        }
        
        Write-Host "Command: $gccCmd $($gccArgs -join ' ')" -ForegroundColor Gray
        & $gccCmd $gccArgs
        
        if ($LASTEXITCODE -eq 0) {
            $buildSuccess = $true
        }
    }
    
    "clang" {
        Write-Host "Building with Clang..." -ForegroundColor Yellow
        
        $clangCmd = "clang++"
        $clangArgs = @(
            "-std=c++17",
            "-O2",
            "-target", "x86_64-pc-windows-msvc",
            "-DUNICODE",
            "-D_UNICODE",
            "-DWINVER=0x0A00",
            "-D_WIN32_WINNT=0x0A00",
            "-DWIN32_LEAN_AND_MEAN",
            "-DMINUX_VERSION=`"2.1.0`"",
            $sourceFiles,
            "-o", "build\MinuxRTOS.exe",
            "-luser32", "-lgdi32", "-ldwmapi", "-lcomctl32",
            "-luxtheme", "-lshell32", "-lpsapi", "-lpdh",
            "-liphlpapi", "-ladvapi32"
        )
        
        if ($Configuration -eq "Debug") {
            $clangArgs = @("-g", "-O0") + $clangArgs[2..($clangArgs.Length-1)]
        }
        
        if ($Verbose) {
            $clangArgs = @("-v") + $clangArgs
        }
        
        Write-Host "Command: $clangCmd $($clangArgs -join ' ')" -ForegroundColor Gray
        & $clangCmd $clangArgs
        
        if ($LASTEXITCODE -eq 0) {
            $buildSuccess = $true
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
