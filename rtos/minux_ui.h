#pragma once
#include <windows.h>
#include <windowsx.h>
#include <dwmapi.h>
#include <shellapi.h>
#include <commctrl.h>
#include <uxtheme.h>
#include <psapi.h>
#include <pdh.h>
#include <iphlpapi.h>
#include <tlhelp32.h>
#include <winternl.h>  // For RTL_OSVERSIONINFOW
#include <vector>
#include <algorithm>

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

// Control IDs
#define ID_BUTTON_PROCESSES    2001
#define ID_BUTTON_MEMORY       2002
#define ID_BUTTON_NETWORK      2003
#define ID_BUTTON_SYSTEM       2004
#define ID_BUTTON_SETTINGS     2005
#define ID_BUTTON_MINIMIZE     2006
#define ID_BUTTON_CLOSE        2007
#define ID_LISTVIEW_PROCESSES  2008
#define ID_PROGRESSBAR_CPU     2009
#define ID_PROGRESSBAR_MEMORY  2010
#define ID_STATIC_STATUS       2011

// Modern Colors
#define COLOR_PRIMARY     RGB(41, 128, 185)   // Modern blue
#define COLOR_SECONDARY   RGB(52, 73, 94)     // Dark slate
#define COLOR_SUCCESS     RGB(39, 174, 96)    // Green
#define COLOR_WARNING     RGB(243, 156, 18)   // Orange
#define COLOR_DANGER      RGB(231, 76, 60)    // Red
#define MINUX_COLOR_BACKGROUND  RGB(44, 62, 80)     // Dark blue-gray
#define COLOR_SURFACE     RGB(55, 75, 95)     // Lighter surface
#define COLOR_TEXT        RGB(236, 240, 241)  // Light text

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

// UI State
struct UIState {
    bool isDragging = false;
    POINT dragStart = {0, 0};
    bool isExpanded = false;
    int currentTab = 0;
    HWND hButtons[7] = {0};
    HWND hListView = 0;
    HWND hProgressCPU = 0;
    HWND hProgressMemory = 0;
    HWND hStatusText = 0;
};

// System information structure
typedef struct {
    DWORD cpuUsage;
    DWORD memoryUsage;
    DWORD processCount;
    DWORD threadCount;
    ULONGLONG uptime;
    wchar_t computerName[MAX_COMPUTERNAME_LENGTH + 1];
    wchar_t osVersion[256];
} SystemInfo;

// Process information structure
typedef struct {
    DWORD processId;
    wchar_t processName[MAX_PATH];
    SIZE_T workingSetSize;
    DWORD cpuUsage;
    DWORD threadCount;
    FILETIME creationTime;
} ProcessInfo;

// Network interface information
typedef struct {
    wchar_t adapterName[256];
    wchar_t ipAddress[16];
    wchar_t macAddress[18];
    DWORD bytesReceived;
    DWORD bytesSent;
    DWORD packetsReceived;
    DWORD packetsSent;
    bool isConnected;
} NetworkInfo;

// Performance monitoring
typedef struct {
    LARGE_INTEGER frequency;
    LARGE_INTEGER lastCpuTime;
    LARGE_INTEGER lastIdleTime;
    LARGE_INTEGER lastKernelTime;
    LARGE_INTEGER lastUserTime;
} PerformanceCounters;

// Function declarations for UI components
MinuxTheme GetCurrentTheme();
void SetDarkTheme();
void SetLightTheme();
void AnimateWindow(HWND hwnd, int startX, int startY, int endX, int endY, DWORD duration);
void CreateTooltip(HWND hParent, HWND hControl, const wchar_t* text);
HWND CreateModernProgressBar(HWND hParent, int x, int y, int width, int height, int id);
HWND CreateModernButton(HWND hParent, const wchar_t* text, int x, int y, int width, int height, int id);
HWND CreateProcessListView(HWND hParent, int x, int y, int width, int height);
HWND CreateProgressBar(HWND hParent, int x, int y, int width, int height, int id);

// System monitoring functions
SystemInfo GetSystemInformation();
std::vector<ProcessInfo> GetProcessList();
std::vector<NetworkInfo> GetNetworkInterfaces();
void StartPerformanceCounters();
void StopPerformanceCounters();

// UI functions
void UpdateSystemInfo();
void PopulateProcessList();
void DrawModernButton(HDC hdc, RECT rect, const wchar_t* text, bool isPressed, bool isHovered, COLORREF color);
void EnableTouchSupport(HWND hwnd);

// Utility functions
void ShowNotification(const wchar_t* title, const wchar_t* message, DWORD type);
void LogMessage(const wchar_t* level, const wchar_t* message);
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

// Global state
extern UIState g_uiState;
extern PerformanceCounters g_perfCounters;
