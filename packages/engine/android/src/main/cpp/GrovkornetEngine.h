#pragma once
#include <jni.h>
#include <vector>

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

#include "ShaderManager.h"
#include "LutGenerator.h"
#include "OverlayCompositor.h"
#include "FrameTimingController.h"

class GrovkornetEngine {
public:
    filament::Engine* engine = nullptr;
    filament::Renderer* renderer = nullptr;
    filament::SwapChain* swapChain = nullptr;
    filament::View* view = nullptr;
    filament::Scene* scene = nullptr;
    filament::Camera* camera = nullptr;
    
    // Multi-pass pipeline views and scenes
    filament::View* viewGrading = nullptr;
    filament::Scene* sceneGrading = nullptr;
    
    filament::View* viewDownsample = nullptr;
    filament::Scene* sceneDownsample = nullptr;
    
    filament::View* viewBlurDown = nullptr;
    filament::Scene* sceneBlurDown = nullptr;
    
    filament::View* viewBlurUp = nullptr;
    filament::Scene* sceneBlurUp = nullptr;
    
    // Geometry
    filament::VertexBuffer* vertexBuffer = nullptr;
    filament::IndexBuffer* indexBuffer = nullptr;
    utils::Entity quadGrading;
    utils::Entity quadDownsample;
    utils::Entity quadBlurDown;
    utils::Entity quadBlurUp;
    utils::Entity quadComposite;
    
    // Textures & Render Targets
    filament::Texture* inputTexture2D = nullptr;
    filament::Texture* inputTextureExternal = nullptr;
    filament::Texture* lutTexture = nullptr;
    
    filament::Texture* gradedTexture = nullptr;
    filament::RenderTarget* gradedRenderTarget = nullptr;
    
    filament::Texture* bloomTexDown = nullptr;
    filament::RenderTarget* bloomDownRenderTarget = nullptr;
    
    filament::Texture* bloomTexBlur = nullptr;
    filament::RenderTarget* bloomBlurRenderTarget = nullptr;
    
    filament::Texture* bloomTexUp = nullptr;
    filament::RenderTarget* bloomUpRenderTarget = nullptr;
    
    filament::Texture* overlayTexture = nullptr;
    filament::Texture* dummyBlackTexture = nullptr;
    filament::SwapChain* liveSwapChain = nullptr;
    filament::Stream* filamentStream = nullptr;
    
    // Subsystems
    ShaderManager shaderManager;
    LutGenerator lutGenerator;
    OverlayCompositor overlayCompositor;
    FrameTimingController timingController;
    
    // DRS (Dynamic Resolution Scaling)
    float currentDrsScale = 1.0f;
    std::vector<float> recentFrameTimes;
    int framesSinceLastDrsScale = 0;
    static constexpr float MIN_DRS_SCALE = 0.5f;
    static constexpr float MAX_DRS_SCALE = 1.0f;
    static constexpr size_t FRAME_TIME_WINDOW_SIZE = 10;
    static constexpr int DRS_COOLDOWN_FRAMES = 30;
    
    JavaVM* javaVm = nullptr;
    int width = 0;
    int height = 0;
    int viewportX = 0;
    int viewportY = 0;
    int viewportWidth = 0;
    int viewportHeight = 0;

    GrovkornetEngine(int w, int h);
    ~GrovkornetEngine();
    
    bool init(AAssetManager* assetManager);
    
    void triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint);
    void applyLutTextureUpdate();
    
    void triggerOverlayUpdate(std::vector<jobject>&& bitmaps, JNIEnv* env);
    void applyOverlayTextureUpdate();

    void updateSwapChain(ANativeWindow* window);
    void updateStream(jobject surfaceTexture, JNIEnv* env);
    void setExternalStream(filament::Stream* stream);
    
    void updateDrsAndViewport();
    void recordFrameTimeAndEvaluate(float frameTimeMs);
};
