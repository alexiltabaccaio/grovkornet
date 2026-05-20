cmake_minimum_required(VERSION 3.22.1)

project(grovkornet-engine)

# Note: The tarball extracts into a nested 'filament' folder, hence the 'filament/filament' path.
set(FILAMENT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/filament/filament")
set(FILAMENT_INCLUDE_DIR "${FILAMENT_DIR}/include")
set(FILAMENT_LIB_DIR "${FILAMENT_DIR}/lib/${ANDROID_ABI}")

# Set C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(
    ${FILAMENT_INCLUDE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp
)

# Macro to add static imported Filament libraries
macro(import_filament_lib name)
    add_library(${name} STATIC IMPORTED)
    set_target_properties(${name} PROPERTIES
        IMPORTED_LOCATION "${FILAMENT_LIB_DIR}/lib${name}.a"
    )
endmacro()

# Import all required Filament static libraries present in v1.71.4
import_filament_lib(filament)
import_filament_lib(backend)
import_filament_lib(filabridge)
import_filament_lib(filamat)
import_filament_lib(filaflat)
import_filament_lib(shaders)
import_filament_lib(utils)
import_filament_lib(geometry)
import_filament_lib(smol-v)
import_filament_lib(bluevk)

# Define our shared library target
add_library(grovkornet-engine SHARED
    src/main/cpp/grovkornet-engine.cpp
)

# Locate standard Android NDK libraries
find_library(log-lib log)
find_library(android-lib android)
find_library(jnigraphics-lib jnigraphics)

# Link everything together
# We use -Wl,--start-group and -Wl,--end-group to resolve circular dependencies between Filament static libs
target_link_libraries(grovkornet-engine
    PRIVATE
    -Wl,--start-group
    filament
    backend
    filabridge
    filamat
    filaflat
    shaders
    utils
    geometry
    smol-v
    bluevk
    -Wl,--end-group
    ${log-lib}
    ${android-lib}
    ${jnigraphics-lib}
    GLESv3
    EGL
)

# --- C++ Unit Tests (GTest) ---
if (EXISTS "${ANDROID_NDK}/sources/third_party/googletest")
    # Define static gtest library directly from NDK source
    add_library(gtest STATIC
        "${ANDROID_NDK}/sources/third_party/googletest/src/gtest-all.cc"
    )
    target_include_directories(gtest SYSTEM PUBLIC
        "${ANDROID_NDK}/sources/third_party/googletest"
        "${ANDROID_NDK}/sources/third_party/googletest/include"
    )
    
    # Define test executable
    add_executable(grovkornet-engine-tests
        src/test/cpp/engine_tests.cpp
        src/main/cpp/grovkornet-engine.cpp
    )
    
    # Include headers
    target_include_directories(grovkornet-engine-tests PRIVATE
        src/main/cpp
        ${FILAMENT_INCLUDE_DIR}
        "${ANDROID_NDK}/sources/third_party/googletest/include"
    )
    
    # Link libraries
    target_link_libraries(grovkornet-engine-tests
        PRIVATE
        gtest
        -Wl,--start-group
        filament
        backend
        filabridge
        filamat
        filaflat
        shaders
        utils
        geometry
        smol-v
        bluevk
        -Wl,--end-group
        ${log-lib}
        ${android-lib}
        ${jnigraphics-lib}
        GLESv3
        EGL
    )
endif()
