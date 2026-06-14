# CMake toolchain file for cross-compiling from Linux to Windows (MinGW-w64)
set(CMAKE_SYSTEM_NAME Windows)
set(CMAKE_SYSTEM_PROCESSOR x86_64)

# Cross compilers
set(CMAKE_C_COMPILER x86_64-w64-mingw32-gcc)
set(CMAKE_CXX_COMPILER x86_64-w64-mingw32-g++)
set(CMAKE_RC_COMPILER x86_64-w64-mingw32-windres)
set(CMAKE_AR x86_64-w64-mingw32-ar)
set(CMAKE_RANLIB x86_64-w64-mingw32-ranlib)

# Search path: only look in target sysroot for libraries, use host for programs
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Cross-compilation flags
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -static-libgcc -static-libstdc++")
set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -static-libgcc -static-libstdc++")

# Python 3.12 for Windows
set(PYTHON_INCLUDE_DIR "${CMAKE_CURRENT_LIST_DIR}/Python-3.12.10/Include")
set(PYTHON_PC_DIR "${CMAKE_CURRENT_LIST_DIR}/Python-3.12.10/PC")
set(PYTHON_LIBRARY "${CMAKE_CURRENT_LIST_DIR}/libpython312.a")
set(PYTHON_DLL_DIR "${CMAKE_CURRENT_LIST_DIR}/python-embed")

# Windows-specific defines
add_definitions(-DMS_WIN64 -DNTDDI_VERSION=0x0A000000 -D_WIN32_WINNT=0x0A00)