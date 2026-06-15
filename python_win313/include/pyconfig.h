/* pyconfig.h for Windows x64 cross-compilation with MinGW (Python 3.13) */
#ifndef Py_CONFIG_H
#define Py_CONFIG_H

/* Windows platform */
#define MS_WINDOWS
#define MS_WIN32
#define MS_WIN64
#define WIN32
#define _WIN32
#define _WIN64
#define NT_THREADS

/* Compiler */
#define COMPILER "[MinGW x86_64 cross]"
#define _GNU_SOURCE 1

/* Python DLL */
#define Py_ENABLE_SHARED 1
#define PYTHON_DLL_NAME "python313.dll"

/* Size types */
#define SIZEOF_LONG 4
#define SIZEOF_LONG_LONG 8
#define SIZEOF_VOID_P 8
#define SIZEOF_SIZE_T 8
#define SIZEOF_TIME_T 8
#define SIZEOF_WCHAR_T 2
#define SIZEOF_PID_T 8
#define SIZEOF_OFF_T 8
#define SIZEOF_FPOS_T 16
#define SIZEOF_UINTPTR_T 8
#define SIZEOF_PTHREAD_T 8

/* Type definitions */
#define HAVE_LONG_LONG 1
#define HAVE_STDINT_H 1
#define HAVE_STDLIB_H 1
#define HAVE_STDDEF_H 1
#define HAVE_STRING_H 1
#define HAVE_STDARG_PROTOTYPES 1
#define HAVE_STRERROR 1
#define HAVE_SYS_STAT_H 1
#define HAVE_SYS_TYPES_H 1
#define HAVE_UNISTD_H 1
#define HAVE_FCNTL_H 1
#define HAVE_SIGNAL_H 1
#define HAVE_IO_H 1
#define HAVE_PROCESS_H 1
#define HAVE_DIRECT_H 1
#define HAVE_WCHAR_H 1
#define HAVE_CONIO_H 1
#define HAVE_LIMITS_H 1
#define HAVE_LOCALE_H 1
#define HAVE_WCHAR_H 1
#define HAVE_FLOAT_H 1

/* Math */
#define HAVE_ACOSH 1
#define HAVE_ASINH 1
#define HAVE_ATANH 1
#define HAVE_COSH 1
#define HAVE_EXPM1 1
#define HAVE_FINITE 1
#define HAVE_FPCLASSIFY 1
#define HAVE_FMOD 1
#define HAVE_FREXP 1
#define HAVE_HYPOT 1
#define HAVE_ISINF 1
#define HAVE_ISNAN 1
#define HAVE_LDEXP 1
#define HAVE_LOG1P 1
#define HAVE_LOG2 1
#define HAVE_MODF 1
#define HAVE_SINH 1
#define HAVE_SQRT 1
#define HAVE_TANH 1
#define HAVE_COPYSIGN 1
#define HAVE_ROUND 1
#define HAVE_TRUNC 1

/* String */
#define HAVE_MEMCHR 1
#define HAVE_MEMMOVE 1
#define HAVE_MEMSET 1
#define HAVE_STRCHR 1
#define HAVE_STRDUP 1
#define HAVE_STRFTIME 1
#define HAVE_STRTOD 1
#define HAVE_STRTOL 1
#define HAVE_STRTOUL 1

/* Other */
#define HAVE_CLOCK 1
#define HAVE_CTIME_R 1
#define HAVE_DYNAMIC_LOADING 1
#define HAVE_FSTAT 1
#define HAVE_FTIME 1
#define HAVE_GETCWD 1
#define HAVE_GETENV 1
#define HAVE_GETPID 1
#define HAVE_GETTIMEOFDAY 1
#define HAVE_GMTIME_R 1
#define HAVE_MKTIME 1
#define HAVE_PUTENV 1
#define HAVE_SELECT 1
#define HAVE_SIGNAL 1
#define HAVE_STAT 1
#define HAVE_STRFTIME 1
#define HAVE_SYS_TIMES_H 1
#define HAVE_SYS_UTSNAME_H 1
#define HAVE_TIME 1
#define HAVE_TIMES 1
#define HAVE_TMPFILE 1
#define HAVE_TMPNAM 1
#define HAVE_UNISTD_H 1
#define HAVE_UTIME_H 1
#define HAVE_WORKING_TZSET 1

/* Endian */
#define PY_LITTLE_ENDIAN 1
#define PY_BIG_ENDIAN 0
#define WORDS_BIGENDIAN 0

/* Py_DEBUG */
/* #undef Py_DEBUG */
/* #undef Py_REF_DEBUG */
/* #undef Py_TRACE_REFS */
/* #undef COUNT_ALLOCS */

/* Python internals */
#define WITH_THREAD 1
#define Py_BUILD_CORE 1
#define HAVE_DECLSPEC_DLL 1

/* Suppress some warnings */
#define _CRT_SECURE_NO_WARNINGS 1
#define _POSIX_C_SOURCE 200809L

/* Python 3.13 specific - free-threaded build not enabled */
#undef Py_GIL_DISABLED

/* Version */
#define PY_VERSION "3.13.0"
#define PY_MAJOR_VERSION 3
#define PY_MINOR_VERSION 13
#define PY_MICRO_VERSION 0

#endif /* Py_CONFIG_H */