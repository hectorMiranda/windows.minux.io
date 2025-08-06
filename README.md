# Minux RTOS Control Center - Advanced Windows Platform Integration

A sophisticated, touch-enabled control center for Minux RTOS with modern Windows platform integration featuring real-time system monitoring, process management, and an advanced user interface.

## 🚀 Features

### Core Functionality
- **Real-time System Monitoring** - Live CPU, memory, and process tracking
- **Process Management** - View and manage running Minux RTOS processes
- **Network Interface Monitoring** - Track network adapters and traffic
- **Touch & Gesture Support** - Full touch screen compatibility with gesture recognition
- **Modern UI** - Glass effects, transparency, and smooth animations
- **System Tray Integration** - Minimizes to system tray with notifications

### Advanced Windows Integration
- **DWM Composition** - Modern visual effects with blur-behind and transparency
- **Touch Input** - Native Windows touch API support for tablets and touch screens
- **High-DPI Awareness** - Crisp rendering on high-resolution displays
- **Performance Monitoring** - Real-time system performance counters
- **Memory Management** - Advanced memory usage analysis and optimization
- **Security Features** - UAC integration and privilege management

### User Interface
- **Material Design Inspired** - Modern flat design with depth and shadows
- **Dark Theme** - Optimized for low-light environments
- **Responsive Layout** - Adapts to different window sizes and orientations
- **Smooth Animations** - Fluid transitions and hover effects
- **Custom Controls** - Hand-crafted modern buttons and progress indicators
- **Contextual Information** - Real-time status updates and tooltips

## 🖥️ System Requirements

- **Operating System**: Windows 10 version 1903 or later (recommended: Windows 11)
- **Architecture**: x64 (64-bit)
- **Memory**: Minimum 4GB RAM (8GB+ recommended for optimal performance)
- **Graphics**: DirectX 11 compatible graphics card with WDDM 2.0+ driver
- **Touch**: Optional - Windows Precision Touchpad or touch screen for gesture support
- **Development**: Visual Studio 2019/2022, MinGW-w64, or Clang with Windows SDK

## 📦 Building the Application

### Quick Build (Recommended)
Use the included PowerShell build script for automatic compiler detection:

```powershell
# Navigate to project directory
cd c:\marcetux\windows.minux.io

# Run build script (auto-detects compiler)
.\build.ps1

# Or specify compiler explicitly
.\build.ps1 -Compiler mingw
.\build.ps1 -Compiler vs
.\build.ps1 -Compiler clang

# Clean build
.\build.ps1 -Clean

# Debug build
.\build.ps1 -Configuration Debug
```

### Manual Build Options

#### Option A: Visual Studio (Recommended for beginners)
```bash
# Using MSBuild
msbuild windows.minux.io.sln /p:Configuration=Release /p:Platform=x64

# Or build from Visual Studio IDE
# 1. Open windows.minux.io.sln
# 2. Set configuration to Release, platform to x64
# 3. Build -> Build Solution (Ctrl+Shift+B)
```

#### Option B: MinGW-w64 (Lightweight option)
```bash
g++ -std=c++17 -O2 -mwindows -static-libgcc -static-libstdc++ ^
    -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 ^
    -DWIN32_LEAN_AND_MEAN -DMINUX_VERSION="2.1.0" ^
    main.cpp minux_system.cpp -o build\MinuxRTOS.exe ^
    -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
    -lpsapi -lpdh -liphlpapi -ladvapi32
```

#### Option C: Clang with MSVC compatibility
```bash
clang++ -std=c++17 -O2 -target x86_64-pc-windows-msvc ^
    -DUNICODE -D_UNICODE -DWINVER=0x0A00 -D_WIN32_WINNT=0x0A00 ^
    -DWIN32_LEAN_AND_MEAN -DMINUX_VERSION="2.1.0" ^
    main.cpp minux_system.cpp -o build\MinuxRTOS.exe ^
    -luser32 -lgdi32 -ldwmapi -lcomctl32 -luxtheme -lshell32 ^
    -lpsapi -lpdh -liphlpapi -ladvapi32
```

## 🎮 Touch & Gesture Controls

The Minux RTOS Control Center is fully optimized for touch input:

### Touch Gestures
- **Single Tap** - Activate buttons and controls
- **Double Tap** - Toggle between expanded and compact view
- **Drag** - Move the window around the screen
- **Pinch to Zoom** - Adjust UI scaling (future feature)
- **Swipe** - Navigate between different tabs and views

### Touch-Optimized Features
- **Large Touch Targets** - All buttons are sized for finger navigation
- **Touch Feedback** - Visual feedback for touch interactions
- **Gesture Recognition** - Advanced multi-touch gesture support
- **Edge Scrolling** - Smooth scrolling in list views and content areas

## 🔧 Configuration & Customization

### Theme Customization
The application supports both light and dark themes. You can modify the theme in `minux_ui.h`:

```cpp
// Dark theme (default)
SetDarkTheme();

// Light theme
SetLightTheme();
```

### Performance Tuning
Adjust update intervals in `build.config`:

```
UPDATE_INTERVAL_MS = 1000        # System monitoring update frequency
FAST_UPDATE_INTERVAL_MS = 100    # Real-time data updates  
ANIMATION_DURATION_MS = 250      # UI animation length
TOUCH_SAMPLE_RATE = 120          # Touch input sampling rate
```

### Feature Flags
Enable/disable features in `build.config`:

```
FEATURES = {
    "TOUCH_SUPPORT": true,
    "DWM_COMPOSITION": true,
    "SYSTEM_TRAY": true,
    "PERFORMANCE_MONITORING": true,
    "NETWORK_MONITORING": true,
    "TRANSPARENCY_EFFECTS": true,
    "MODERN_ANIMATIONS": true,
    "GESTURE_SUPPORT": true
}
```

## 📊 System Monitoring Features

### Process Monitoring
- Real-time process list with CPU and memory usage
- Process creation/termination notifications
- Thread count and handle monitoring
- Process tree visualization

### Memory Analysis
- Physical and virtual memory usage
- Memory allocation patterns
- Garbage collection statistics
- Memory leak detection

### Network Monitoring
- Network adapter status and configuration
- Real-time bandwidth monitoring  
- Packet statistics and error rates
- Connection tracking

### Performance Counters
- CPU usage per core and total
- Disk I/O statistics
- Network throughput
- System uptime and load averages

## 🛠️ Development & Debugging

### Project Structure
```
windows.minux.io/
├── main.cpp                 # Main application entry point
├── minux_ui.h              # UI components and theme definitions
├── minux_system.cpp        # System monitoring and utilities
├── build.ps1               # PowerShell build script
├── build.config            # Build configuration
├── README.md               # This file
├── rtos/                   # Visual Studio project files
│   ├── *.cpp, *.h         # Additional source files
│   ├── *.rc               # Resource files
│   └── *.vcxproj          # Project configuration
└── build/                  # Output directory
    └── MinuxRTOS.exe       # Compiled executable
```

### Debugging
For debugging with Visual Studio:
1. Set build configuration to Debug
2. Add breakpoints in source code
3. Press F5 to start debugging
4. Use the Debug Output window for diagnostic messages

### Logging
The application includes comprehensive logging:
```cpp
LogMessage("INFO", "Application started");
LogMessage("ERROR", "Failed to initialize component");
LogMessage("DEBUG", "Processing touch input");
```

## 🔐 Security & Permissions

### User Account Control (UAC)
The application requests standard user privileges by default. For advanced system monitoring features, it may prompt for administrator elevation:

```cpp
if (!IsUserAdmin()) {
    // Prompt for elevation if needed
    ElevateToAdmin();
}
```

### Security Features
- **Privilege Separation** - Runs with minimal required privileges
- **Input Validation** - All user inputs are sanitized
- **Memory Protection** - DEP and ASLR enabled
- **Code Signing** - Release builds are digitally signed (when available)

## 🚀 Performance Optimization

### Memory Management
- Smart pointers for automatic memory management
- Object pooling for frequently created/destroyed objects
- Lazy loading for expensive operations
- Efficient data structures optimized for real-time updates

### Rendering Optimization
- Hardware-accelerated graphics when available
- Dirty rectangle updates to minimize redraws
- Cached bitmap rendering for static elements
- Asynchronous background operations

### CPU Optimization
- Multi-threaded architecture for background tasks
- SIMD instructions for mathematical operations
- Optimized algorithms for real-time data processing
- Efficient event handling and message queuing

## 📝 Troubleshooting

### Common Build Issues

**MinGW-w64 Issues:**
- Ensure MinGW-w64 is properly installed and in PATH
- Download from: https://winlibs.com/ (pre-built binaries)
- Verify with: `g++ --version`

**Visual Studio Issues:**
- Install "Desktop development with C++" workload
- Ensure Windows 10 SDK is installed
- Run from Developer Command Prompt if needed

**Linker Errors:**
- Ensure all required libraries are linked
- Check that Windows SDK version matches target
- Verify architecture (x64) matches compiler settings

### Runtime Issues

**Touch Not Working:**
- Verify Windows Touch API is available
- Check device drivers for touch hardware
- Enable touch in Windows Settings

**Performance Issues:**
- Reduce update intervals in configuration
- Disable transparency effects on slower hardware
- Close other resource-intensive applications

**DWM Effects Not Working:**
- Enable Desktop Window Manager in Windows
- Update graphics drivers
- Check that Aero/transparency is enabled

## 🤝 Contributing

We welcome contributions to the Minux RTOS Control Center! Please see our contribution guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with appropriate tests
4. Submit a pull request with detailed description

### Code Style
- Use modern C++17 features
- Follow Microsoft naming conventions for Windows APIs
- Add comprehensive comments for complex algorithms
- Include unit tests for new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the build logs for specific error messages

---

**Minux RTOS Control Center v2.1.0** - Advanced Windows Platform Integration
Built with ❤️ for the Minux RTOS ecosystem
   - Add `C:\mingw64\bin` to your system PATH:
     - Press Win+R, type `sysdm.cpl`, press Enter
     - Click "Environment Variables"
     - Under "System Variables", find and select "Path", click "Edit"
     - Click "New" and add `C:\mingw64\bin`
     - Click OK and restart your command prompt

**To build:**
1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```cmd
   cd c:\marcetux\windows.minux.io
   ```
3. Verify g++ is working:
   ```cmd
   g++ --version
   ```
4. Compile the program:
   ```cmd
   g++ -o minux-client.exe main.cpp -lgdi32 -luser32
   ```

### Option 3: Using Microsoft C++ Compiler (cl.exe)

**First-time setup:**
1. If you don't have Visual Studio installed, download **Build Tools for Visual Studio**
2. During installation, select "C++ build tools"

**To build:**
1. Open **"Developer Command Prompt for Visual Studio"** or **"x64 Native Tools Command Prompt"**
   - Search for these in the Start menu after installing Visual Studio/Build Tools
2. Navigate to the project directory:
   ```cmd
   cd c:\marcetux\windows.minux.io
   ```
3. Compile the program:
   ```cmd
   cl main.cpp user32.lib gdi32.lib
   ```

## Quick Start (No Compiler Required)

If you don't want to install a compiler, you can:
1. Use an online C++ compiler like [https://www.onlinegdb.com/online_c++_compiler](https://www.onlinegdb.com/online_c++_compiler)
2. Copy the `main.cpp` code and compile it online
3. Note: Online compilers won't be able to run Windows-specific code, but can check for syntax errors

## Running the Program

After building, run the executable:

```cmd
minux-client.exe
```

Or if using Visual Studio's cl.exe:
```cmd
main.exe
```

## Program Behavior

- A small transparent window will appear at coordinates (100, 100)
- The window displays "Minux Client Widget" text in white
- The window stays on top of other applications
- The window has a semi-transparent black background
- Close the widget by terminating the process (Task Manager or Alt+F4 may not work due to WS_EX_TOOLWINDOW style)

## Customization

You can modify the following aspects in `main.cpp`:

- **Window size**: Change the width and height in `CreateWindowEx` (currently 300x100)
- **Position**: Modify the x and y coordinates (currently 100, 100)
- **Transparency**: Adjust the alpha value in `SetLayeredWindowAttributes` (0-255, currently 230)
- **Text content**: Change the text in the `WM_PAINT` case
- **Colors**: Modify `SetTextColor` and background brush colors

## Troubleshooting

- **"g++ is not recognized" or "cl is not recognized"**: 
  - Your compiler is not installed or not in your system PATH
  - For MinGW-w64: Follow the PATH setup instructions above
  - For Visual Studio: Use the "Developer Command Prompt" instead of regular Command Prompt
- **"Command not found" errors**: Ensure your compiler is properly installed and added to your system PATH
- **Missing libraries**: Make sure to link against `user32.lib` and `gdi32.lib`
- **Window not appearing**: Check that the coordinates (100, 100) are within your screen bounds
- **Cannot close window**: Use Task Manager to terminate the process, or add proper window closing handling
- **Permission errors**: Try running Command Prompt as Administrator

### Testing Your Compiler Setup

Before building the project, test if your compiler is working:

**For MinGW-w64:**
```cmd
g++ --version
```

**For Visual Studio cl.exe:**
```cmd
cl
```

If these commands work, you're ready to build the project.

## License

This is a minimal example program for educational purposes.
