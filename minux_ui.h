#pragma once
#include <windows.h>

// Minux RTOS UI Components Header
// Advanced UI elements and system integration

// Modern UI Constants
#define MINUX_VERSION "2.1.0"
#define MINUX_BUILD_DATE __DATE__

// Window dimensions
#define WINDOW_WIDTH 600
#define WINDOW_HEIGHT 400
#define TITLE_BAR_HEIGHT 40
#define BUTTON_HEIGHT 35
#define BUTTON_WIDTH 100

// Animation constants
#define ANIMATION_DURATION 250
#define HOVER_TRANSITION_TIME 150

// Touch and gesture constants
#define MIN_TOUCH_DISTANCE 10
#define DOUBLE_TAP_TIME 300
#define GESTURE_THRESHOLD 50

// System monitoring intervals
#define SYSTEM_UPDATE_INTERVAL 1000  // 1 second
#define FAST_UPDATE_INTERVAL 100     // 100ms for real-time data

// UI Theme colors
typedef struct {
    COLORREF primary;
    COLORREF secondary;
    COLORREF success;
    COLORREF warning;
    COLORREF danger;
    COLORREF background;
    COLORREF surface;
    COLORREF text;
    COLORREF textSecondary;
} MinuxTheme;

// System information structure
typedef struct {
    DWORD cpuUsage;
    DWORD memoryUsage;
    DWORD processCount;
    DWORD threadCount;
    ULONGLONG uptime;
    char computerName[MAX_COMPUTERNAME_LENGTH + 1];
    char osVersion[256];
} SystemInfo;

// Process information structure
typedef struct {
    DWORD processId;
    char processName[MAX_PATH];
    SIZE_T workingSetSize;
    DWORD cpuUsage;
    DWORD threadCount;
    FILETIME creationTime;
} ProcessInfo;

// Network interface information
typedef struct {
    char adapterName[256];
    char ipAddress[16];
    char macAddress[18];
    DWORD bytesReceived;
    DWORD bytesSent;
    DWORD packetsReceived;
    DWORD packetsSent;
    bool isConnected;
} NetworkInfo;

// Function declarations for UI components
MinuxTheme GetCurrentTheme();
void SetDarkTheme();
void SetLightTheme();
void AnimateWindow(HWND hwnd, int startX, int startY, int endX, int endY, DWORD duration);
void CreateTooltip(HWND hParent, HWND hControl, const char* text);
HWND CreateModernProgressBar(HWND hParent, int x, int y, int width, int height, int id);
HWND CreateModernListBox(HWND hParent, int x, int y, int width, int height, int id);

// System monitoring functions
SystemInfo GetSystemInformation();
std::vector<ProcessInfo> GetProcessList();
std::vector<NetworkInfo> GetNetworkInterfaces();
void StartPerformanceCounters();
void StopPerformanceCounters();

// Utility functions
void ShowNotification(const char* title, const char* message, DWORD type);
void LogMessage(const char* level, const char* message);
bool IsUserAdmin();
void ElevateToAdmin();

// Touch and gesture support
void HandleTouchGesture(HWND hwnd, TOUCHINPUT* inputs, UINT count);
void ProcessPinchGesture(float scale);
void ProcessSwipeGesture(int direction, int velocity);

// Graphics and rendering
void DrawGradientRect(HDC hdc, RECT rect, COLORREF color1, COLORREF color2, bool vertical);
void DrawRoundedRect(HDC hdc, RECT rect, int radius, COLORREF color, COLORREF borderColor);
void DrawGlowEffect(HDC hdc, RECT rect, COLORREF color, int intensity);
HBITMAP CreateCompatibleBitmapWithAlpha(HDC hdc, int width, int height);

// Performance monitoring
typedef struct {
    LARGE_INTEGER frequency;
    LARGE_INTEGER lastCpuTime;
    LARGE_INTEGER lastIdleTime;
    LARGE_INTEGER lastKernelTime;
    LARGE_INTEGER lastUserTime;
} PerformanceCounters;

extern PerformanceCounters g_perfCounters;
