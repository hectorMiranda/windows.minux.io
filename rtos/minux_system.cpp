#include "framework.h"
#include "minux_ui.h"

#pragma comment(lib, "psapi.lib")
#pragma comment(lib, "pdh.lib")
#pragma comment(lib, "iphlpapi.lib")

// Global performance counters
PerformanceCounters g_perfCounters = {0};
static PDH_HQUERY g_hQuery = NULL;
static PDH_HCOUNTER g_hCpuCounter = NULL;

// Theme definitions
MinuxTheme g_darkTheme = {
    RGB(41, 128, 185),   // primary
    RGB(52, 73, 94),     // secondary
    RGB(39, 174, 96),    // success
    RGB(243, 156, 18),   // warning
    RGB(231, 76, 60),    // danger
    RGB(44, 62, 80),     // background
    RGB(55, 75, 95),     // surface
    RGB(236, 240, 241),  // text
    RGB(149, 165, 166)   // textSecondary
};

MinuxTheme g_lightTheme = {
    RGB(52, 152, 219),   // primary
    RGB(44, 62, 80),     // secondary
    RGB(46, 204, 113),   // success
    RGB(230, 126, 34),   // warning
    RGB(231, 76, 60),    // danger
    RGB(236, 240, 241),  // background
    RGB(255, 255, 255),  // surface
    RGB(44, 62, 80),     // text
    RGB(127, 140, 141)   // textSecondary
};

static bool g_isDarkTheme = true;

// Get current theme
MinuxTheme GetCurrentTheme() {
    return g_isDarkTheme ? g_darkTheme : g_lightTheme;
}

void SetDarkTheme() {
    g_isDarkTheme = true;
}

void SetLightTheme() {
    g_isDarkTheme = false;
}

// Initialize performance counters
void StartPerformanceCounters() {
    PdhOpenQuery(NULL, 0, &g_hQuery);
    PdhAddEnglishCounter(g_hQuery, L"\\Processor(_Total)\\% Processor Time", 0, &g_hCpuCounter);
    PdhCollectQueryData(g_hQuery);
    
    QueryPerformanceFrequency(&g_perfCounters.frequency);
}

void StopPerformanceCounters() {
    if (g_hQuery) {
        PdhCloseQuery(g_hQuery);
        g_hQuery = NULL;
    }
}

// Get system information
SystemInfo GetSystemInformation() {
    SystemInfo info = {0};
    
    // Get CPU usage
    if (g_hQuery && g_hCpuCounter) {
        PdhCollectQueryData(g_hQuery);
        PDH_FMT_COUNTERVALUE cpuValue;
        if (PdhGetFormattedCounterValue(g_hCpuCounter, PDH_FMT_DOUBLE, NULL, &cpuValue) == ERROR_SUCCESS) {
            info.cpuUsage = (DWORD)cpuValue.doubleValue;
        }
    }
    
    // Get memory usage
    MEMORYSTATUSEX memStatus = {0};
    memStatus.dwLength = sizeof(memStatus);
    if (GlobalMemoryStatusEx(&memStatus)) {
        info.memoryUsage = memStatus.dwMemoryLoad;
    }
    
    // Get process and thread count
    PERFORMANCE_INFORMATION perfInfo = {0};
    perfInfo.cb = sizeof(perfInfo);
    if (GetPerformanceInfo(&perfInfo, sizeof(perfInfo))) {
        info.processCount = perfInfo.ProcessCount;
        info.threadCount = perfInfo.ThreadCount;
    }
    
    // Get uptime
    info.uptime = GetTickCount64();
    
    // Get computer name
    DWORD nameSize = sizeof(info.computerName)/sizeof(wchar_t);
    GetComputerNameW(info.computerName, &nameSize);
    
    // Get OS version using RtlGetVersion (recommended replacement for GetVersionEx)
    typedef NTSTATUS (WINAPI* RtlGetVersionPtr)(PRTL_OSVERSIONINFOW);
    HMODULE hMod = GetModuleHandleW(L"ntdll.dll");
    if (hMod) {
        RtlGetVersionPtr fxPtr = (RtlGetVersionPtr)GetProcAddress(hMod, "RtlGetVersion");
        if (fxPtr) {
            RTL_OSVERSIONINFOW rovi = {0};
            rovi.dwOSVersionInfoSize = sizeof(rovi);
            if (fxPtr(&rovi) == 0) {
                swprintf_s(info.osVersion, L"Windows %d.%d Build %d", 
                         rovi.dwMajorVersion, rovi.dwMinorVersion, rovi.dwBuildNumber);
            }
        }
    }
    
    // Fallback to generic version if RtlGetVersion fails
    if (wcslen(info.osVersion) == 0) {
        wcscpy_s(info.osVersion, L"Windows 10+");
    }
    
    return info;
}

// Get process list
std::vector<ProcessInfo> GetProcessList() {
    std::vector<ProcessInfo> processes;
    
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return processes;
    
    PROCESSENTRY32W pe32 = {0};
    pe32.dwSize = sizeof(pe32);
    
    if (Process32FirstW(hSnapshot, &pe32)) {
        do {
            ProcessInfo info = {0};
            info.processId = pe32.th32ProcessID;
            wcscpy_s(info.processName, pe32.szExeFile);
            info.threadCount = pe32.cntThreads;
            
            // Get memory usage
            HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pe32.th32ProcessID);
            if (hProcess) {
                PROCESS_MEMORY_COUNTERS pmc = {0};
                if (GetProcessMemoryInfo(hProcess, &pmc, sizeof(pmc))) {
                    info.workingSetSize = pmc.WorkingSetSize;
                }
                
                // Get creation time
                FILETIME createTime, exitTime, kernelTime, userTime;
                if (GetProcessTimes(hProcess, &createTime, &exitTime, &kernelTime, &userTime)) {
                    info.creationTime = createTime;
                }
                
                CloseHandle(hProcess);
            }
            
            processes.push_back(info);
        } while (Process32NextW(hSnapshot, &pe32));
    }
    
    CloseHandle(hSnapshot);
    
    // Sort by memory usage (descending)
    std::sort(processes.begin(), processes.end(), 
              [](const ProcessInfo& a, const ProcessInfo& b) {
                  return a.workingSetSize > b.workingSetSize;
              });
    
    return processes;
}

// Get network interfaces
std::vector<NetworkInfo> GetNetworkInterfaces() {
    std::vector<NetworkInfo> interfaces;
    
    DWORD dwSize = 0;
    if (GetAdaptersInfo(NULL, &dwSize) == ERROR_BUFFER_OVERFLOW) {
        IP_ADAPTER_INFO* pAdapterInfo = (IP_ADAPTER_INFO*)malloc(dwSize);
        if (pAdapterInfo && GetAdaptersInfo(pAdapterInfo, &dwSize) == NO_ERROR) {
            IP_ADAPTER_INFO* pAdapter = pAdapterInfo;
            while (pAdapter) {
                NetworkInfo info = {0};
                MultiByteToWideChar(CP_ACP, 0, pAdapter->AdapterName, -1, info.adapterName, 256);
                MultiByteToWideChar(CP_ACP, 0, pAdapter->IpAddressList.IpAddress.String, -1, info.ipAddress, 16);
                
                // Format MAC address
                swprintf_s(info.macAddress, L"%02X-%02X-%02X-%02X-%02X-%02X",
                         pAdapter->Address[0], pAdapter->Address[1], pAdapter->Address[2],
                         pAdapter->Address[3], pAdapter->Address[4], pAdapter->Address[5]);
                
                info.isConnected = (wcscmp(info.ipAddress, L"0.0.0.0") != 0);
                
                interfaces.push_back(info);
                pAdapter = pAdapter->Next;
            }
        }
        free(pAdapterInfo);
    }
    
    return interfaces;
}

// Draw gradient rectangle
void DrawGradientRect(HDC hdc, RECT rect, COLORREF color1, COLORREF color2, bool vertical) {
    int width = rect.right - rect.left;
    int height = rect.bottom - rect.top;
    
    if (vertical) {
        for (int y = 0; y < height; y++) {
            float ratio = (float)y / height;
            COLORREF color = RGB(
                GetRValue(color1) + (GetRValue(color2) - GetRValue(color1)) * ratio,
                GetGValue(color1) + (GetGValue(color2) - GetGValue(color1)) * ratio,
                GetBValue(color1) + (GetBValue(color2) - GetBValue(color1)) * ratio
            );
            
            HPEN hPen = CreatePen(PS_SOLID, 1, color);
            HPEN hOldPen = (HPEN)SelectObject(hdc, hPen);
            
            MoveToEx(hdc, rect.left, rect.top + y, NULL);
            LineTo(hdc, rect.right, rect.top + y);
            
            SelectObject(hdc, hOldPen);
            DeleteObject(hPen);
        }
    } else {
        for (int x = 0; x < width; x++) {
            float ratio = (float)x / width;
            COLORREF color = RGB(
                GetRValue(color1) + (GetRValue(color2) - GetRValue(color1)) * ratio,
                GetGValue(color1) + (GetGValue(color2) - GetGValue(color1)) * ratio,
                GetBValue(color1) + (GetBValue(color2) - GetBValue(color1)) * ratio
            );
            
            HPEN hPen = CreatePen(PS_SOLID, 1, color);
            HPEN hOldPen = (HPEN)SelectObject(hdc, hPen);
            
            MoveToEx(hdc, rect.left + x, rect.top, NULL);
            LineTo(hdc, rect.left + x, rect.bottom);
            
            SelectObject(hdc, hOldPen);
            DeleteObject(hPen);
        }
    }
}

// Draw rounded rectangle
void DrawRoundedRect(HDC hdc, RECT rect, int radius, COLORREF color, COLORREF borderColor) {
    HBRUSH hBrush = CreateSolidBrush(color);
    HPEN hPen = CreatePen(PS_SOLID, 1, borderColor);
    
    HBRUSH hOldBrush = (HBRUSH)SelectObject(hdc, hBrush);
    HPEN hOldPen = (HPEN)SelectObject(hdc, hPen);
    
    RoundRect(hdc, rect.left, rect.top, rect.right, rect.bottom, radius, radius);
    
    SelectObject(hdc, hOldBrush);
    SelectObject(hdc, hOldPen);
    DeleteObject(hBrush);
    DeleteObject(hPen);
}

// Show notification
void ShowNotification(const wchar_t* title, const wchar_t* message, DWORD type) {
    MessageBox(NULL, message, title, type | MB_TOPMOST);
}

// Check if user is admin
bool IsUserAdmin() {
    BOOL isAdmin = FALSE;
    PSID adminGroup = NULL;
    SID_IDENTIFIER_AUTHORITY ntAuthority = SECURITY_NT_AUTHORITY;
    
    if (AllocateAndInitializeSid(&ntAuthority, 2, SECURITY_BUILTIN_DOMAIN_RID,
                                DOMAIN_ALIAS_RID_ADMINS, 0, 0, 0, 0, 0, 0, &adminGroup)) {
        CheckTokenMembership(NULL, adminGroup, &isAdmin);
        FreeSid(adminGroup);
    }
    
    return isAdmin != FALSE;
}

// Create modern progress bar
HWND CreateModernProgressBar(HWND hParent, int x, int y, int width, int height, int id) {
    HWND hProgress = CreateWindow(
        PROGRESS_CLASS, NULL,
        WS_VISIBLE | WS_CHILD | PBS_SMOOTH | PBS_SMOOTHREVERSE,
        x, y, width, height,
        hParent, (HMENU)id, GetModuleHandle(NULL), NULL
    );
    
    // Set modern visual style
    SetWindowTheme(hProgress, L"", L"");
    SendMessage(hProgress, PBM_SETRANGE32, 0, 100);
    SendMessage(hProgress, PBM_SETBARCOLOR, 0, GetCurrentTheme().primary);
    SendMessage(hProgress, PBM_SETBKCOLOR, 0, GetCurrentTheme().surface);
    
    return hProgress;
}

// Handle touch gestures
void HandleTouchGesture(HWND hwnd, TOUCHINPUT* inputs, UINT count) {
    static POINT lastTouch = {0, 0};
    static DWORD lastTouchTime = 0;
    static bool isDragging = false;
    
    for (UINT i = 0; i < count; i++) {
        POINT pt = {TOUCH_COORD_TO_PIXEL(inputs[i].x), TOUCH_COORD_TO_PIXEL(inputs[i].y)};
        ScreenToClient(hwnd, &pt);
        
        if (inputs[i].dwFlags & TOUCHEVENTF_DOWN) {
            DWORD currentTime = GetTickCount();
            
            // Check for double tap
            if (currentTime - lastTouchTime < DOUBLE_TAP_TIME &&
                abs(pt.x - lastTouch.x) < MIN_TOUCH_DISTANCE &&
                abs(pt.y - lastTouch.y) < MIN_TOUCH_DISTANCE) {
                // Handle double tap - toggle expanded view
                PostMessage(hwnd, WM_COMMAND, ID_BUTTON_SYSTEM, 0);
            }
            
            lastTouch = pt;
            lastTouchTime = currentTime;
            isDragging = true;
        }
        else if (inputs[i].dwFlags & TOUCHEVENTF_MOVE && isDragging) {
            // Handle drag gesture
            int deltaX = pt.x - lastTouch.x;
            int deltaY = pt.y - lastTouch.y;
            
            if (abs(deltaX) > GESTURE_THRESHOLD || abs(deltaY) > GESTURE_THRESHOLD) {
                RECT rect;
                GetWindowRect(hwnd, &rect);
                SetWindowPos(hwnd, NULL, rect.left + deltaX, rect.top + deltaY, 
                           0, 0, SWP_NOSIZE | SWP_NOZORDER);
                lastTouch = pt;
            }
        }
        else if (inputs[i].dwFlags & TOUCHEVENTF_UP) {
            isDragging = false;
        }
    }
}
