#pragma once
#include <jni.h>
#include <vector>
#include <mutex>

#include <android/native_window.h>

#include <filament/Engine.h>
#include <filament/Viewport.h>
#include <filament/Renderer.h>
#include <filament/SwapChain.h>
#include <filament/Stream.h>
#include <filament/View.h>
#include <filament/Scene.h>
#include <filament/Camera.h>
#include <filament/Texture.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <utils/Entity.h>

#include <android/hardware_buffer_jni.h>
#include <android/asset_manager.h>

#include "pipeline/ShaderManager.h"
#include "pipeline/LutGenerator.h"
#include "pipeline/OverlayCompositor.h"
#include "utils/FrameTimingController.h"
#include "utils/DrsManager.h"
#include "pipeline/PipelineRenderer.h"

#include "state/CameraStateManager.h"

class GrovkornetEngine {
public:
    filament::Engine* engine = nullptr;
    filament::Renderer* renderer = nullptr;
    filament::SwapChain* swapChain = nullptr;
    filament::View* view = nullptr;
    filament::Scene* scene = nullptr;
    filament::Camera* camera = nullptr;
    
    // Geometry
    filament::VertexBuffer* vertexBuffer = nullptr;
    filament::IndexBuffer* indexBuffer = nullptr;
    
    // Textures & Render Targets
    filament::Texture* inputTexture2D = nullptr;
    filament::Texture* inputTextureExternal = nullptr;
    filament::Texture* lutTexture = nullptr;
    
    filament::Texture* overlayTexture = nullptr;
    filament::Texture* dummyBlackTexture = nullptr;
    filament::SwapChain* liveSwapChain = nullptr;
    filament::Stream* filamentStream = nullptr;
    
    // Subsystems
    ShaderManager shaderManager;
    LutGenerator lutGenerator;
    OverlayCompositor overlayCompositor;
    FrameTimingController timingController;
    PipelineRenderer pipelineRenderer;
    
    // DRS (Dynamic Resolution Scaling)
    DrsManager drsManager;
    
    JavaVM* javaVm = nullptr;
    int width = 0;
    int height = 0;
    int viewportX = 0;
    int viewportY = 0;
    int viewportWidth = 0;
    int viewportHeight = 0;
    bool skipGlFlush = false;
    bool skipFilamentRender = false;

    GrovkornetEngine(int w, int h);
    ~GrovkornetEngine();
    
    bool init(AAssetManager* assetManager);
    
    void triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint,
                          float satRed, float satOrange, float satYellow, float satGreen,
                          float satCyan, float satBlue, float satPurple, float satMagenta,
                          float boundMagentaRed, float boundRedOrange, float boundOrangeYellow, float boundYellowGreen,
                          float boundGreenCyan, float boundCyanBlue, float boundBluePurple, float boundPurpleMagenta,
                          float blackLevel, float highlights, float pivot,
                          float contrastAuto, float blackLevelAuto, float highlightsAuto, float pivotAuto,
                          float hue,
                          float hueRed, float hueOrange, float hueYellow, float hueGreen,
                          float hueCyan, float hueBlue, float huePurple, float hueMagenta);
    void applyLutTextureUpdate();
    void applyShaderParameters(const RenderState* state, filament::MaterialInstance* inputMaterial, bool waitForLut);
    
    void triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env);
    void applyOverlayTextureUpdate();

    void updateSwapChain(ANativeWindow* window);
    void updateStream(jobject surfaceTexture, JNIEnv* env);
    void setExternalStream(filament::Stream* stream);
    
    void updateDrsAndViewport();
    void recordFrameTimeAndEvaluate(float frameTimeMs);
    float getDrsScale() const { return drsManager.getScale(); }
    void simulateFrameTime(float frameTimeMs);
 
    bool renderOffscreenFrame(void* pixelsIn, void* pixelsOut, const RenderState* state);
    bool renderHardwareBufferFrame(AHardwareBuffer* ahb, const RenderState* state);
    bool renderLiveFrame(const RenderState* state, const float* uvMatrixIn,
                         int cameraWidth, int cameraHeight, int vpW, int vpH,
                         bool skipScreenRender, bool isNewFrame,
                         int& actualFps, int& stampedFps, bool& fpsUpdated);
private:
    mutable std::mutex m_engineMutex;
};
