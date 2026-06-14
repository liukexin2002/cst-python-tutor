@echo off
REM ============================================================================
REM build_windows.bat
REM Build pylibavoid for Windows with Python 3.13
REM
REM Prerequisites:
REM   1. Visual Studio 2022 (or 2019) with "Desktop development with C++"
REM   2. Python 3.13 installed (from python.org)
REM   3. pybind11 installed: pip install pybind11
REM   4. CMake >= 3.15 installed
REM
REM Usage:
REM   Just double-click or run from a command prompt.
REM   The .pyd file will be in the "build" directory.
REM ============================================================================

setlocal enabledelayedexpansion

echo ============================================================================
echo  pylibavoid Windows Build Script
echo  Python 3.13
echo ============================================================================
echo.

REM ---- Find Python 3.13 ----
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found in PATH. Please install Python 3.13 and add it to PATH.
    pause
    exit /b 1
)

python --version
echo.

REM ---- Install pybind11 if not already installed ----
python -c "import pybind11" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installing pybind11 via pip...
    python -m pip install pybind11
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install pybind11.
        pause
        exit /b 1
    )
) else (
    echo [OK] pybind11 found.
)
echo.

REM ---- Find CMake ----
where cmake >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake not found. Please install CMake and add it to PATH.
    pause
    exit /b 1
)
echo [OK] CMake found.
echo.

REM ---- Clean and create build directory ----
if exist build rmdir /s /q build
mkdir build
cd build

REM ---- Configure with CMake ----
echo [INFO] Configuring with CMake...
echo.

cmake .. -G "Visual Studio 17 2022" -A x64 ^
    -DPYTHON_EXECUTABLE:FILEPATH="%PYTHON_EXECUTABLE%" ^
    -DCMAKE_BUILD_TYPE=Release

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake configuration failed.
    cd ..
    pause
    exit /b 1
)
echo.

REM ---- Build ----
echo [INFO] Building pylibavoid (Release)...
echo.
cmake --build . --config Release --target pylibavoid

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    cd ..
    pause
    exit /b 1
)
echo.

REM ---- Locate and copy .pyd ----
echo [INFO] Build successful! Looking for pylibavoid*.pyd...
echo.

REM Copy the .pyd to the build root for easy access
for /r %%f in (*.pyd) do (
    echo  Found: %%f
    copy /y "%%f" "pylibavoid.pyd" >nul
)

if exist pylibavoid.pyd (
    echo.
    echo ============================================================================
    echo  SUCCESS! pylibavoid.pyd is ready at:
    echo    %CD%\pylibavoid.pyd
    echo.
    echo  To test:
    echo    cd %CD%
    echo    python ..\test_pylibavoid.py
    echo ============================================================================
) else (
    echo [WARNING] No .pyd file found in build subdirectories.
    echo   Check the build\Release\ or build\Debug\ folder.
)

cd ..
echo.
pause