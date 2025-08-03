# Minux Client - Windows Widget

A minimal, customizable widget for Windows that displays as a transparent overlay window.

## Features

- Lightweight Windows widget with transparent background
- Always on top display
- Minimal system resource usage
- Customizable appearance and positioning

## Prerequisites

To build and run this program, you'll need:

- Windows operating system
- A C++ compiler (choose one of the following options):

### Compiler Options (Choose One):

#### Option A: Visual Studio (Recommended for beginners)
- Download **Visual Studio Community** (free) from [https://visualstudio.microsoft.com/downloads/](https://visualstudio.microsoft.com/downloads/)
- During installation, select "Desktop development with C++" workload

#### Option B: MinGW-w64 (Lightweight option)
- Download from [https://www.mingw-w64.org/downloads/](https://www.mingw-w64.org/downloads/)
- **Easier installation**: Download from [https://winlibs.com/](https://winlibs.com/) (pre-built binaries)
- Extract to a folder (e.g., `C:\mingw64`) and add `C:\mingw64\bin` to your system PATH

#### Option C: Microsoft Build Tools
- Download **Build Tools for Visual Studio** from [https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- Select "C++ build tools" during installation

## Building the Program

### Option 1: Using Visual Studio

1. Open Visual Studio
2. Create a new project or open the existing solution
3. Add `main.cpp` to your project
4. Build the project (Ctrl+Shift+B)
5. The executable will be generated in the Debug/Release folder

### Option 2: Using MinGW-w64 (Command Line)

**First-time setup:**
1. If you don't have MinGW-w64 installed:
   - Download from [https://winlibs.com/](https://winlibs.com/) (easier option)
   - Or from [https://www.mingw-w64.org/downloads/](https://www.mingw-w64.org/downloads/)
   - Extract to `C:\mingw64` (or your preferred location)
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
