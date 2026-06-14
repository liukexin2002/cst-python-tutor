cmake_minimum_required(VERSION 3.15)
project(pylibavoid VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Allow override of Python paths (for cross-compilation)
if(NOT DEFINED PYTHON_INCLUDE_DIR)
    message(FATAL_ERROR "PYTHON_INCLUDE_DIR must be set (Python headers path)")
endif()
if(NOT DEFINED PYTHON_PC_DIR)
    message(FATAL_ERROR "PYTHON_PC_DIR must be set (PC/pyconfig.h path)")
endif()
if(NOT DEFINED PYTHON_LIBRARY)
    message(FATAL_ERROR "PYTHON_LIBRARY must be set (libpython3.x.a import library)")
endif()
if(NOT DEFINED PYTHON_DLL_DIR)
    message(FATAL_ERROR "PYTHON_DLL_DIR must be set (directory containing python3.x.dll)")
endif()

# pybind11 include directory (header-only, cross-compilation safe)
set(pybind11_INCLUDE_DIRS "/root/.pyenv/versions/3.14.4/lib/python3.14/site-packages/pybind11/include")

message(STATUS "Python include dir: ${PYTHON_INCLUDE_DIR}")
message(STATUS "Python PC dir:      ${PYTHON_PC_DIR}")
message(STATUS "Python library:     ${PYTHON_LIBRARY}")
message(STATUS "Python DLL dir:     ${PYTHON_DLL_DIR}")
message(STATUS "pybind11 include:   ${pybind11_INCLUDE_DIRS}")

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
    ${PYTHON_PC_DIR}
    ${PYTHON_INCLUDE_DIR}
    ${pybind11_INCLUDE_DIRS}
)
target_compile_features(avoid_static PUBLIC cxx_std_17)

# Python extension module (.pyd) for Windows
add_library(pylibavoid MODULE bindings.cpp)
target_link_libraries(pylibavoid PRIVATE avoid_static ${PYTHON_LIBRARY})
target_include_directories(pylibavoid PRIVATE
    ${LIBAVOID_SRC_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libcola
    ${CMAKE_CURRENT_SOURCE_DIR}/../adaptagrams/cola/libdialect
    ${PYTHON_INCLUDE_DIR}
    ${PYTHON_PC_DIR}
    ${pybind11_INCLUDE_DIRS}
)

# Set output name to .pyd for Windows
set_target_properties(pylibavoid PROPERTIES
    PREFIX ""
    SUFFIX ".pyd"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
)

# Copy Python DLL next to the .pyd file at build time
add_custom_command(TARGET pylibavoid POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${PYTHON_DLL_DIR}/python312.dll"
        "${CMAKE_BINARY_DIR}/python312.dll"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${PYTHON_DLL_DIR}/python3.dll"
        "${CMAKE_BINARY_DIR}/python3.dll"
    COMMENT "Copying Python runtime DLLs to output directory"
)