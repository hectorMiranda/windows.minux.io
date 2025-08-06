// Minux RTOS Control Center - Advanced Windows Platform Integration
// Features: Touch Support, Modern UI, System Monitoring, Process Control

#include "framework.h"
#include "rtos.h"

#define MAX_LOADSTRING 100

HINSTANCE hInst;                                // current instance
WCHAR szTitle[MAX_LOADSTRING];                  // The title bar text
WCHAR szWindowClass[MAX_LOADSTRING];            // the main window class name

// Global UI state
UIState g_uiState;

// Touch and gesture support
void EnableTouchSupport(HWND hwnd) {
    RegisterTouchWindow(hwnd, 0);
}

// Create modern rounded button
HWND CreateModernButton(HWND hParent, const wchar_t* text, int x, int y, int width, int height, int id) {
    HWND hButton = CreateWindow(
        L"BUTTON", text,
        WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON | BS_OWNERDRAW,
        x, y, width, height,
        hParent, (HMENU)(UINT_PTR)id, GetModuleHandle(NULL), NULL
    );
    return hButton;
}

// Create progress bar
HWND CreateProgressBar(HWND hParent, int x, int y, int width, int height, int id) {
    InitCommonControls();
    HWND hProgress = CreateWindow(
        PROGRESS_CLASS, NULL,
        WS_VISIBLE | WS_CHILD | PBS_SMOOTH,
        x, y, width, height,
        hParent, (HMENU)(UINT_PTR)id, GetModuleHandle(NULL), NULL
    );
    SendMessage(hProgress, PBM_SETRANGE, 0, MAKELPARAM(0, 100));
    return hProgress;
}

// Create list view for processes
HWND CreateProcessListView(HWND hParent, int x, int y, int width, int height) {
    InitCommonControls();
    HWND hListView = CreateWindow(
        WC_LISTVIEW, NULL,
        WS_VISIBLE | WS_CHILD | LVS_REPORT | LVS_SINGLESEL,
        x, y, width, height,
        hParent, (HMENU)(UINT_PTR)ID_LISTVIEW_PROCESSES, GetModuleHandle(NULL), NULL
    );
    
    // Add columns
    LVCOLUMN lvc = {0};
    lvc.mask = LVCF_TEXT | LVCF_WIDTH;
    lvc.cx = 150;
    lvc.pszText = const_cast<LPWSTR>(L"Process Name");
    ListView_InsertColumn(hListView, 0, &lvc);
    
    lvc.cx = 80;
    lvc.pszText = const_cast<LPWSTR>(L"PID");
    ListView_InsertColumn(hListView, 1, &lvc);
    
    lvc.cx = 100;
    lvc.pszText = const_cast<LPWSTR>(L"Memory (MB)");
    ListView_InsertColumn(hListView, 2, &lvc);
    
    lvc.cx = 80;
    lvc.pszText = const_cast<LPWSTR>(L"CPU %");
    ListView_InsertColumn(hListView, 3, &lvc);
    
    return hListView;
}

// Draw modern button with gradient and rounded corners
void DrawModernButton(HDC hdc, RECT rect, const wchar_t* text, bool isPressed, bool isHovered, COLORREF color) {
    // Create rounded rectangle path
    HRGN hRgn = CreateRoundRectRgn(rect.left, rect.top, rect.right, rect.bottom, 8, 8);
    SelectClipRgn(hdc, hRgn);
    
    // Gradient background
    COLORREF topColor = isPressed ? RGB(GetRValue(color) - 20, GetGValue(color) - 20, GetBValue(color) - 20) : color;
    COLORREF bottomColor = RGB(GetRValue(color) + 20, GetGValue(color) + 20, GetBValue(color) + 20);
    
    if (isHovered && !isPressed) {
        topColor = RGB(GetRValue(color) + 10, GetGValue(color) + 10, GetBValue(color) + 10);
    }
    
    // Simple gradient simulation
    HBRUSH hBrush = CreateSolidBrush(topColor);
    FillRect(hdc, &rect, hBrush);
    DeleteObject(hBrush);
    
    // Border
    HPEN hPen = CreatePen(PS_SOLID, 1, RGB(GetRValue(color) - 40, GetGValue(color) - 40, GetBValue(color) - 40));
    HPEN hOldPen = (HPEN)SelectObject(hdc, hPen);
    
    MoveToEx(hdc, rect.left + 8, rect.top, NULL);
    LineTo(hdc, rect.right - 8, rect.top);
    
    SelectObject(hdc, hOldPen);
    DeleteObject(hPen);
    
    // Text
    SetBkMode(hdc, TRANSPARENT);
    SetTextColor(hdc, COLOR_TEXT);
    HFONT hFont = CreateFont(14, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, 
                            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
                            CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_DONTCARE, L"Segoe UI");
    HFONT hOldFont = (HFONT)SelectObject(hdc, hFont);
    
    DrawText(hdc, text, -1, &rect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    
    SelectObject(hdc, hOldFont);
    DeleteObject(hFont);
    SelectClipRgn(hdc, NULL);
    DeleteObject(hRgn);
}

// Update system information
void UpdateSystemInfo() {
    if (!g_uiState.hProgressCPU || !g_uiState.hProgressMemory) return;
    
    // Simulate CPU usage (in real implementation, use GetSystemTimes)
    static int cpuUsage = 25;
    cpuUsage = (cpuUsage + rand() % 20 - 10);
    if (cpuUsage < 0) cpuUsage = 0;
    if (cpuUsage > 100) cpuUsage = 100;
    
    SendMessage(g_uiState.hProgressCPU, PBM_SETPOS, cpuUsage, 0);
    
    // Get real memory usage
    MEMORYSTATUSEX memInfo = {0};
    memInfo.dwLength = sizeof(MEMORYSTATUSEX);
    GlobalMemoryStatusEx(&memInfo);
    
    DWORD memUsage = memInfo.dwMemoryLoad;
    SendMessage(g_uiState.hProgressMemory, PBM_SETPOS, memUsage, 0);
    
    // Update status text
    if (g_uiState.hStatusText) {
        wchar_t statusText[256];
        swprintf_s(statusText, L"CPU: %d%% | Memory: %d%% | Processes: 156 | Uptime: 2h 45m", 
                 cpuUsage, memUsage);
        SetWindowText(g_uiState.hStatusText, statusText);
    }
}

// Populate process list (placeholder data)
void PopulateProcessList() {
    if (!g_uiState.hListView) return;
    
    ListView_DeleteAllItems(g_uiState.hListView);
    
    // Sample process data
    const wchar_t* processes[][4] = {
        {L"minux-kernel.exe", L"1", L"45.2", L"12.5"},
        {L"minux-scheduler.exe", L"156", L"23.1", L"8.2"},
        {L"minux-driver-mgr.exe", L"234", L"18.7", L"5.1"},
        {L"minux-fs-service.exe", L"445", L"34.5", L"15.3"},
        {L"minux-net-stack.exe", L"567", L"28.9", L"9.7"},
        {L"minux-ui-compositor.exe", L"678", L"52.3", L"18.9"},
        {L"minux-power-mgr.exe", L"789", L"12.4", L"3.2"},
        {L"minux-security.exe", L"890", L"19.8", L"6.4"}
    };
    
    for (int i = 0; i < 8; i++) {
        LVITEM lvi = {0};
        lvi.mask = LVIF_TEXT;
        lvi.iItem = i;
        lvi.iSubItem = 0;
        lvi.pszText = (LPWSTR)processes[i][0];
        ListView_InsertItem(g_uiState.hListView, &lvi);
        
        for (int j = 1; j < 4; j++) {
            ListView_SetItemText(g_uiState.hListView, i, j, (LPWSTR)processes[i][j]);
        }
    }
}

// Forward declarations of functions included in this code module:
ATOM                MyRegisterClass(HINSTANCE hInstance);
BOOL                InitInstance(HINSTANCE, int);
LRESULT CALLBACK    WndProc(HWND, UINT, WPARAM, LPARAM);
INT_PTR CALLBACK    About(HWND, UINT, WPARAM, LPARAM);

int APIENTRY wWinMain(_In_ HINSTANCE hInstance,
                     _In_opt_ HINSTANCE hPrevInstance,
                     _In_ LPWSTR    lpCmdLine,
                     _In_ int       nCmdShow)
{
    UNREFERENCED_PARAMETER(hPrevInstance);
    UNREFERENCED_PARAMETER(lpCmdLine);

    // Initialize common controls for modern UI
    INITCOMMONCONTROLSEX icex;
    icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icex.dwICC = ICC_LISTVIEW_CLASSES | ICC_PROGRESS_CLASS | ICC_STANDARD_CLASSES;
    InitCommonControlsEx(&icex);

    // Initialize global strings
    LoadStringW(hInstance, IDS_APP_TITLE, szTitle, MAX_LOADSTRING);
    LoadStringW(hInstance, IDC_RTOS, szWindowClass, MAX_LOADSTRING);
    MyRegisterClass(hInstance);

    // Perform application initialization:
    if (!InitInstance (hInstance, nCmdShow))
    {
        return FALSE;
    }

    HACCEL hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_RTOS));

    MSG msg;

    // Main message loop:
    while (GetMessage(&msg, nullptr, 0, 0))
    {
        if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }

    return (int) msg.wParam;
}

//
//  FUNCTION: MyRegisterClass()
//
//  PURPOSE: Registers the window class.
//
ATOM MyRegisterClass(HINSTANCE hInstance)
{
    WNDCLASSEXW wcex;

    wcex.cbSize = sizeof(WNDCLASSEX);

    wcex.style          = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc    = WndProc;
    wcex.cbClsExtra     = 0;
    wcex.cbWndExtra     = 0;
    wcex.hInstance      = hInstance;
    wcex.hIcon          = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_RTOS));
    wcex.hCursor        = LoadCursor(nullptr, IDC_ARROW);
    wcex.hbrBackground  = CreateSolidBrush(MINUX_COLOR_BACKGROUND);
    wcex.lpszMenuName   = MAKEINTRESOURCEW(IDC_RTOS);
    wcex.lpszClassName  = szWindowClass;
    wcex.hIconSm        = LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));

    return RegisterClassExW(&wcex);
}

//
//   FUNCTION: InitInstance(HINSTANCE, int)
//
//   PURPOSE: Saves instance handle and creates main window
//
//   COMMENTS:
//
//        In this function, we save the instance handle in a global variable and
//        create and display the main program window.
//
BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
   hInst = hInstance; // Store instance handle in our global variable

   HWND hWnd = CreateWindowW(szWindowClass, szTitle, 
      WS_OVERLAPPEDWINDOW | WS_VISIBLE,
      CW_USEDEFAULT, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 
      nullptr, nullptr, hInstance, nullptr);

   if (!hWnd)
   {
      return FALSE;
   }

   // Enable modern visual effects
   SetLayeredWindowAttributes(hWnd, 0, 240, LWA_ALPHA); // Slight transparency
   
   // Enable DWM composition for modern effects
   BOOL enabled = FALSE;
   DwmIsCompositionEnabled(&enabled);
   if (enabled) {
       MARGINS margins = {-1, -1, -1, -1};
       DwmExtendFrameIntoClientArea(hWnd, &margins);
       
       // Enable blur behind
       DWM_BLURBEHIND bb = {0};
       bb.dwFlags = DWM_BB_ENABLE | DWM_BB_BLURREGION;
       bb.fEnable = TRUE;
       bb.hRgnBlur = CreateRectRgn(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
       DwmEnableBlurBehindWindow(hWnd, &bb);
       DeleteObject(bb.hRgnBlur);
   }

   ShowWindow(hWnd, nCmdShow);
   UpdateWindow(hWnd);

   return TRUE;
}

//
//  FUNCTION: WndProc(HWND, UINT, WPARAM, LPARAM)
//
//  PURPOSE: Processes messages for the main window.
//
//  WM_COMMAND  - process the application menu
//  WM_PAINT    - Paint the main window
//  WM_DESTROY  - post a quit message and return
//
//
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_CREATE: {
        // Enable modern visual styles
        SetWindowTheme(hWnd, L"DarkMode_Explorer", NULL);
        
        // Enable touch support
        EnableTouchSupport(hWnd);
        
        // Create modern UI elements
        int buttonWidth = 100;
        int buttonHeight = 35;
        int margin = 10;
        
        // Title bar buttons
        g_uiState.hButtons[5] = CreateModernButton(hWnd, L"−", 520, 10, 30, 25, ID_BUTTON_MINIMIZE);
        g_uiState.hButtons[6] = CreateModernButton(hWnd, L"×", 555, 10, 30, 25, ID_BUTTON_CLOSE);
        
        // Main control buttons
        g_uiState.hButtons[0] = CreateModernButton(hWnd, L"Processes", margin, 50, buttonWidth, buttonHeight, ID_BUTTON_PROCESSES);
        g_uiState.hButtons[1] = CreateModernButton(hWnd, L"Memory", margin + buttonWidth + 5, 50, buttonWidth, buttonHeight, ID_BUTTON_MEMORY);
        g_uiState.hButtons[2] = CreateModernButton(hWnd, L"Network", margin + (buttonWidth + 5) * 2, 50, buttonWidth, buttonHeight, ID_BUTTON_NETWORK);
        g_uiState.hButtons[3] = CreateModernButton(hWnd, L"System", margin + (buttonWidth + 5) * 3, 50, buttonWidth, buttonHeight, ID_BUTTON_SYSTEM);
        g_uiState.hButtons[4] = CreateModernButton(hWnd, L"Settings", margin + (buttonWidth + 5) * 4, 50, buttonWidth, buttonHeight, ID_BUTTON_SETTINGS);
        
        // Process list view
        g_uiState.hListView = CreateProcessListView(hWnd, margin, 100, 570, 200);
        
        // Progress bars for system monitoring
        CreateWindow(L"STATIC", L"CPU Usage:", WS_VISIBLE | WS_CHILD,
                    margin, 320, 80, 20, hWnd, NULL, GetModuleHandle(NULL), NULL);
        g_uiState.hProgressCPU = CreateProgressBar(hWnd, margin + 85, 320, 200, 20, ID_PROGRESSBAR_CPU);
        
        CreateWindow(L"STATIC", L"Memory:", WS_VISIBLE | WS_CHILD,
                    margin + 300, 320, 60, 20, hWnd, NULL, GetModuleHandle(NULL), NULL);
        g_uiState.hProgressMemory = CreateProgressBar(hWnd, margin + 365, 320, 200, 20, ID_PROGRESSBAR_MEMORY);
        
        // Status bar
        g_uiState.hStatusText = CreateWindow(L"STATIC", L"Minux RTOS Control Center - Ready",
                                           WS_VISIBLE | WS_CHILD | SS_LEFT,
                                           margin, 360, 570, 20, hWnd, (HMENU)(UINT_PTR)ID_STATIC_STATUS, GetModuleHandle(NULL), NULL);
        
        // Initialize data
        PopulateProcessList();
        
        // Start system monitoring timer
        SetTimer(hWnd, 1, 1000, NULL); // Update every second
        
        return 0;
    }
    
    case WM_TIMER:
        if (wParam == 1) {
            UpdateSystemInfo();
        }
        return 0;
    
    case WM_TOUCH: {
        // Handle touch input
        UINT cInputs = LOWORD(wParam);
        PTOUCHINPUT pInputs = new TOUCHINPUT[cInputs];
        
        if (GetTouchInputInfo((HTOUCHINPUT)lParam, cInputs, pInputs, sizeof(TOUCHINPUT))) {
            for (UINT i = 0; i < cInputs; i++) {
                POINT pt = {TOUCH_COORD_TO_PIXEL(pInputs[i].x), TOUCH_COORD_TO_PIXEL(pInputs[i].y)};
                ScreenToClient(hWnd, &pt);
                
                if (pInputs[i].dwFlags & TOUCHEVENTF_DOWN) {
                    // Touch down - similar to mouse down
                    SendMessage(hWnd, WM_LBUTTONDOWN, 0, MAKELPARAM(pt.x, pt.y));
                }
                else if (pInputs[i].dwFlags & TOUCHEVENTF_UP) {
                    // Touch up - similar to mouse up
                    SendMessage(hWnd, WM_LBUTTONUP, 0, MAKELPARAM(pt.x, pt.y));
                }
            }
        }
        
        delete[] pInputs;
        CloseTouchInputHandle((HTOUCHINPUT)lParam);
        return 0;
    }
    
    case WM_DRAWITEM: {
        DRAWITEMSTRUCT* dis = (DRAWITEMSTRUCT*)lParam;
        if (dis->CtlType == ODT_BUTTON) {
            wchar_t buttonText[256];
            GetWindowText(dis->hwndItem, buttonText, sizeof(buttonText)/sizeof(wchar_t));
            
            COLORREF buttonColor = COLOR_PRIMARY;
            if (dis->CtlID == ID_BUTTON_CLOSE) buttonColor = COLOR_DANGER;
            else if (dis->CtlID == ID_BUTTON_MINIMIZE) buttonColor = COLOR_WARNING;
            
            bool isPressed = (dis->itemState & ODS_SELECTED) != 0;
            bool isHovered = (dis->itemState & ODS_HOTLIGHT) != 0;
            
            DrawModernButton(dis->hDC, dis->rcItem, buttonText, isPressed, isHovered, buttonColor);
        }
        return TRUE;
    }

    case WM_COMMAND:
        {
            int wmId = LOWORD(wParam);
            // Parse the menu selections:
            switch (wmId)
            {
            case ID_BUTTON_PROCESSES:
                PopulateProcessList();
                g_uiState.currentTab = 0;
                SetWindowText(g_uiState.hStatusText, L"Processes view - Real-time process monitoring");
                break;
            case ID_BUTTON_MEMORY:
                g_uiState.currentTab = 1;
                SetWindowText(g_uiState.hStatusText, L"Memory view - System memory analysis");
                break;
            case ID_BUTTON_NETWORK:
                g_uiState.currentTab = 2;
                SetWindowText(g_uiState.hStatusText, L"Network view - Network interface monitoring");
                break;
            case ID_BUTTON_SYSTEM:
                g_uiState.currentTab = 3;
                SetWindowText(g_uiState.hStatusText, L"System view - Hardware and kernel information");
                break;
            case ID_BUTTON_SETTINGS:
                g_uiState.currentTab = 4;
                SetWindowText(g_uiState.hStatusText, L"Settings - Configure Minux RTOS parameters");
                break;
            case ID_BUTTON_MINIMIZE:
                ShowWindow(hWnd, SW_MINIMIZE);
                break;
            case ID_BUTTON_CLOSE:
                PostQuitMessage(0);
                break;
            case IDM_ABOUT:
                DialogBox(hInst, MAKEINTRESOURCE(IDD_ABOUTBOX), hWnd, About);
                break;
            case IDM_EXIT:
                DestroyWindow(hWnd);
                break;
            default:
                return DefWindowProc(hWnd, message, wParam, lParam);
            }
        }
        return 0;
        
    case WM_LBUTTONDOWN: {
        // Enable window dragging
        if (HIWORD(lParam) < 40) { // Title bar area
            g_uiState.isDragging = true;
            g_uiState.dragStart.x = LOWORD(lParam);
            g_uiState.dragStart.y = HIWORD(lParam);
            SetCapture(hWnd);
        }
        return 0;
    }
    
    case WM_MOUSEMOVE: {
        if (g_uiState.isDragging) {
            RECT rect;
            GetWindowRect(hWnd, &rect);
            int newX = rect.left + LOWORD(lParam) - g_uiState.dragStart.x;
            int newY = rect.top + HIWORD(lParam) - g_uiState.dragStart.y;
            SetWindowPos(hWnd, NULL, newX, newY, 0, 0, SWP_NOSIZE | SWP_NOZORDER);
        }
        return 0;
    }
    
    case WM_LBUTTONUP: {
        if (g_uiState.isDragging) {
            g_uiState.isDragging = false;
            ReleaseCapture();
        }
        return 0;
    }
        
    case WM_PAINT:
        {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hWnd, &ps);
            
            // Modern gradient background
            RECT clientRect;
            GetClientRect(hWnd, &clientRect);
            
            // Create gradient brush
            HBRUSH hBrush = CreateSolidBrush(MINUX_COLOR_BACKGROUND);
            FillRect(hdc, &clientRect, hBrush);
            DeleteObject(hBrush);
            
            // Title bar
            RECT titleRect = {0, 0, clientRect.right, 40};
            HBRUSH hTitleBrush = CreateSolidBrush(COLOR_SECONDARY);
            FillRect(hdc, &titleRect, hTitleBrush);
            DeleteObject(hTitleBrush);
            
            // Title text
            SetBkMode(hdc, TRANSPARENT);
            SetTextColor(hdc, COLOR_TEXT);
            HFONT hTitleFont = CreateFont(16, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
                                         DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
                                         CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_DONTCARE, L"Segoe UI");
            HFONT hOldFont = (HFONT)SelectObject(hdc, hTitleFont);
            
            TextOut(hdc, 15, 12, L"Minux RTOS Control Center", 25);
            
            // Version info
            HFONT hSmallFont = CreateFont(12, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
                                         DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
                                         CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_DONTCARE, L"Segoe UI");
            SelectObject(hdc, hSmallFont);
            SetTextColor(hdc, RGB(180, 180, 180));
            TextOut(hdc, 250, 15, L"v2.1.0 - Real-time OS", 21);
            
            SelectObject(hdc, hOldFont);
            DeleteObject(hTitleFont);
            DeleteObject(hSmallFont);
            
            EndPaint(hWnd, &ps);
        }
        break;
    case WM_DESTROY:
        KillTimer(hWnd, 1);
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProc(hWnd, message, wParam, lParam);
    }
    return 0;
}

// Message handler for about box.
INT_PTR CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
    UNREFERENCED_PARAMETER(lParam);
    switch (message)
    {
    case WM_INITDIALOG:
        return (INT_PTR)TRUE;

    case WM_COMMAND:
        if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL)
        {
            EndDialog(hDlg, LOWORD(wParam));
            return (INT_PTR)TRUE;
        }
        break;
    }
    return (INT_PTR)FALSE;
}
