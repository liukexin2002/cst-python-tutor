cmake_minimum_required(VERSION 3.15)
project(pylibavoid VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ------------------------------------------------------------------
# Cross-compilation: Windows Python 3.13 paths
# ------------------------------------------------------------------
set(PYTHON_ROOT "/workspace/python_win313")
set(PYTHON_INCLUDE_DIR "${PYTHON_ROOT}/include")
set(PYTHON_LIBRARY "${PYTHON_ROOT}/libs/libpython313.a")

# pybind11 headers (platform-independent, just need include path)
set(pybind11_INCLUDE_DIR "/root/.pyenv/versions/3.12.13/lib/python3.12/site-packages/pybind11/include")

# ------------------------------------------------------------------
# libavoid source directory
# ------------------------------------------------------------------
set(LIBAVOID_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/adaptagrams/cola/libavoid")
# libavoid headers use "libavoid/xxx.h" includes, so include parent dir
set(LIBAVOID_PARENT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/adaptagrams/cola")

file(GLOB LIBAVOID_SOURCES
    ${LIBAVOID_SRC_DIR}/*.cpp
)

# Static library for libavoid
add_library(avoid_static STATIC ${LIBAVOID_SOURCES})
target_include_directories(avoid_static PUBLIC
    ${LIBAVOID_PARENT_DIR}
)
target_compile_features(avoid_static PUBLIC cxx_std_17)
target_compile_definitions(avoid_static PUBLIC AVOID_EXPORTS=1)

# Python extension module (manually, not via pybind11_add_module for cross-compile)
add_library(pylibavoid SHARED bindings.cpp)

target_include_directories(pylibavoid PRIVATE
    ${PYTHON_INCLUDE_DIR}
    ${pybind11_INCLUDE_DIR}
    ${LIBAVOID_PARENT_DIR}
)

target_compile_definitions(pylibavoid PRIVATE
    AVOID_EXPORTS=1
    PYBIND11_DETAILED_ERROR_MESSAGES
)

target_link_libraries(pylibavoid PRIVATE
    avoid_static
    ${PYTHON_LIBRARY}
)

# Output as .pyd (basically a .dll with .pyd extension)
set_target_properties(pylibavoid PROPERTIES
    PREFIX ""
    SUFFIX ".pyd"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
)

# Windows-specific compile flags
target_compile_options(pylibavoid PRIVATE
    -D_WIN32_WINNT=0x0A00
    -DMS_WIN64
    -DWIN32
    -D_WIN32
    -D_WIN64
    -DPy_ENABLE_SHARED
)

# Linker flags for Windows DLL
target_link_options(pylibavoid PRIVATE
    -static-libgcc
    -static-libstdc++
    -Wl,--enable-stdcall-fixup
)