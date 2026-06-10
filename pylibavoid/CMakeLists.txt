cmake_minimum_required(VERSION 3.15)
project(pylibavoid VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Find pybind11 - try pip-installed location first
find_package(pybind11 REQUIRED PATHS
    /root/.pyenv/versions/3.14.4/lib/python3.14/site-packages/pybind11/share/cmake/pybind11
    /root/.pyenv/versions/3.14.4/lib/python3.14/site-packages/pybind11
)

# libavoid source directory (adaptagrams/cola/libavoid/)
set(LIBAVOID_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libavoid")

# Collect all libavoid source files
file(GLOB LIBAVOID_SOURCES
    ${LIBAVOID_SRC_DIR}/*.cpp
)

# Create static library for libavoid
add_library(avoid_static STATIC ${LIBAVOID_SOURCES})
target_include_directories(avoid_static PUBLIC
    ${LIBAVOID_SRC_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libcola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libdialect
)
target_compile_features(avoid_static PUBLIC cxx_std_17)
# Disable SWIG guard to expose destructors (needed for non-SWIG bindings)
target_compile_definitions(avoid_static PUBLIC AVOID_EXPORTS=1)

# Python extension module
pybind11_add_module(pylibavoid bindings.cpp)
target_link_libraries(pylibavoid PRIVATE avoid_static)
target_include_directories(pylibavoid PRIVATE
    ${LIBAVOID_SRC_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libcola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libdialect
)

# Set output directory
set_target_properties(pylibavoid PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
)
