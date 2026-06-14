cmake_minimum_required(VERSION 3.15)
project(pylibavoid VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# ------------------------------------------------------------------
# Find pybind11 - relies on pip-installed location
# On Windows, run: pip install pybind11
# ------------------------------------------------------------------
find_package(pybind11 REQUIRED)

# ------------------------------------------------------------------
# libavoid source directory (within this package)
# ------------------------------------------------------------------
set(LIBAVOID_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/adaptagrams/cola/libavoid")

# Collect all libavoid source files
file(GLOB LIBAVOID_SOURCES
    ${LIBAVOID_SRC_DIR}/*.cpp
)

# Create static library for libavoid
add_library(avoid_static STATIC ${LIBAVOID_SOURCES})
target_include_directories(avoid_static PUBLIC
    ${LIBAVOID_SRC_DIR}
)
target_compile_features(avoid_static PUBLIC cxx_std_17)
# Disable SWIG guard to expose destructors (needed for non-SWIG bindings)
target_compile_definitions(avoid_static PUBLIC AVOID_EXPORTS=1)

# Python extension module
pybind11_add_module(pylibavoid bindings.cpp)
target_link_libraries(pylibavoid PRIVATE avoid_static)
target_include_directories(pylibavoid PRIVATE
    ${LIBAVOID_SRC_DIR}
)

# Set output directory and .pyd suffix on Windows
set_target_properties(pylibavoid PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
    SUFFIX ".pyd"
)