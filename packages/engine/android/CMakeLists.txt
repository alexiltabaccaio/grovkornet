cmake_minimum_required(VERSION 3.22.1)

project(grovkornet-engine)

set(FILAMENT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/filament")
set(FILAMENT_INCLUDE_DIR "${FILAMENT_DIR}/include")
set(FILAMENT_LIB_DIR "${FILAMENT_DIR}/lib/${ANDROID_ABI}")

# Set C++17 standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(
    ${FILAMENT_INCLUDE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp/core
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp/pipeline
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp/utils
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main/cpp/jni
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
import_filament_lib(filaflat)
import_filament_lib(shaders)
import_filament_lib(utils)
import_filament_lib(geometry)
import_filament_lib(smol-v)
import_filament_lib(bluevk)
import_filament_lib(zstd)

# Define our shared library target
add_library(grovkornet-engine SHARED
    src/main/cpp/core/GrovkornetEngine.cpp
    src/main/cpp/pipeline/PipelineRenderer.cpp
    src/main/cpp/pipeline/GeometryBuilder.cpp
    src/main/cpp/pipeline/LutGenerator.cpp
    src/main/cpp/pipeline/OverlayCompositor.cpp
    src/main/cpp/pipeline/ShaderManager.cpp
    src/main/cpp/utils/WatermarkEngine.cpp
    src/main/cpp/utils/MatrixTransformCalculator.cpp
    src/main/cpp/utils/FrameTimingController.cpp
    src/main/cpp/utils/DrsManager.cpp
    src/main/cpp/jni/GrovkornetJni.cpp
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
    filaflat
    shaders
    utils
    geometry
    smol-v
    bluevk
    zstd
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
        src/test/cpp/TestRunner.cpp
        src/test/cpp/GrovkornetEngine.test.cpp
        src/test/cpp/WatermarkEngine.test.cpp
        src/test/cpp/MatrixTransformCalculator.test.cpp
        src/test/cpp/FrameTimingController.test.cpp
        src/test/cpp/GeometryBuilder.test.cpp
        src/test/cpp/LutGenerator.test.cpp
        src/test/cpp/ShaderManager.test.cpp
        src/test/cpp/OverlayCompositor.test.cpp
        src/test/cpp/DrsManager.test.cpp
        src/main/cpp/core/GrovkornetEngine.cpp
        src/main/cpp/pipeline/PipelineRenderer.cpp
        src/main/cpp/pipeline/GeometryBuilder.cpp
        src/main/cpp/pipeline/LutGenerator.cpp
        src/main/cpp/pipeline/OverlayCompositor.cpp
        src/main/cpp/pipeline/ShaderManager.cpp
        src/main/cpp/utils/WatermarkEngine.cpp
        src/main/cpp/utils/MatrixTransformCalculator.cpp
        src/main/cpp/utils/FrameTimingController.cpp
        src/main/cpp/utils/DrsManager.cpp
    )
    
    # Include headers
    target_include_directories(grovkornet-engine-tests PRIVATE
        src/main/cpp
        src/main/cpp/core
        src/main/cpp/pipeline
        src/main/cpp/utils
        src/main/cpp/jni
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
        filaflat
        shaders
        utils
        geometry
        smol-v
        bluevk
        zstd
        -Wl,--end-group
        ${log-lib}
        ${android-lib}
        ${jnigraphics-lib}
        GLESv3
        EGL
    )
endif()
