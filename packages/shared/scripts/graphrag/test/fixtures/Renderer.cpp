#include "Renderer.h"
#include <vector>

// Mock JNI types and macros to satisfy the IDE compiler/linter
#define JNIEXPORT
#define JNICALL
typedef long long jlong;
typedef int jint;
typedef void* JNIEnv;
typedef void* jobject;

extern "C" JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare(
    JNIEnv* env, jobject thiz, jint width, jint height
) {
    renderFrame();
    std::vector<int> v;
    return 0;
}
