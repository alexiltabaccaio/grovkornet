#pragma once

#include <filament/Engine.h>
#include <filament/Viewport.h>
#include <filament/Renderer.h>
#include <filament/SwapChain.h>
#include <filament/View.h>
#include <filament/Scene.h>
#include <filament/Camera.h>
#include <filament/Texture.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <utils/Entity.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>

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
    
    // Geometry for full-screen quads
    filament::VertexBuffer* vertexBuffer = nullptr;
    filament::IndexBuffer* indexBuffer = nullptr;
    utils::Entity quadEntity;
    utils::Entity quadGrading;
    utils::Entity quadDownsample;
    utils::Entity quadBlurDown;
    utils::Entity quadBlurUp;
    utils::Entity quadComposite;
    
    // Materials
    filament::Material* material2D = nullptr;
    filament::MaterialInstance* materialInstance2D = nullptr;
    
    filament::Material* materialExternal = nullptr;
    filament::MaterialInstance* materialInstanceExternal = nullptr;
    
    filament::Material* materialDownsample = nullptr;
    filament::MaterialInstance* materialInstanceDownsample = nullptr;
    
    filament::Material* materialBlurDown = nullptr;
    filament::MaterialInstance* materialInstanceBlurDown = nullptr;
    
    filament::Material* materialBlurUp = nullptr;
    filament::MaterialInstance* materialInstanceBlurUp = nullptr;
    
    filament::Material* materialComposite = nullptr;
    filament::MaterialInstance* materialInstanceComposite = nullptr;
    
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
    
    // Background LUT generation thread
    std::thread lutThread;
    std::mutex lutMutex;
    std::condition_variable lutCv;
    bool lutThreadRunning = false;
    bool lutParametersDirty = false;
    bool lutDataReady = false;
    
    // Sliders
    float currentSaturation = 1.0f;
    float currentContrast = 1.0f;
    float currentEv = 0.0f;
    float currentWhiteBalance = 5000.0f;
    float currentTint = 0.0f;
    
    // Cache of active parameters mapped into GPU texture
    float activeSaturation = -1.0f;
    float activeContrast = -1.0f;
    float activeEv = -1.0f;
    float activeWhiteBalance = -1.0f;
    float activeTint = -1.0f;
    
    // Grid size for 3D LUT
    static constexpr int LUT_SIZE = 33;
    std::vector<uint8_t> lutBuffer; // Size: LUT_SIZE * LUT_SIZE * LUT_SIZE * 4 (RGBA)
    
    int width = 0;
    int height = 0;

    GrovkornetEngine(int w, int h);
    ~GrovkornetEngine();
    
    bool init();
    
    void triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint);
    void applyLutTextureUpdate();
    
private:
    bool initMaterials();
    void initGeometry();
    void lutGenerationLoop();
};
