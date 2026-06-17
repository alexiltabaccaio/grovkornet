#include <gtest/gtest.h>
#include <iostream>
#include "core/GrovkornetEngine.h"
#include "core/FrameRenderer.h"
#include "pipeline/GeometryBuilder.h"
#include <filament/Engine.h>
#include <filament/Camera.h>
#include <filament/Texture.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <utils/Entity.h>
#include <utils/EntityManager.h>
#include <fstream>
#include <vector>
#include <string>
#include <android/hardware_buffer.h>

static filament::Material* loadMaterial(filament::Engine& engine, const std::string& name) {
    std::string path = "/data/local/tmp/materials/" + name + ".filamat";
    std::ifstream file(path, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        path = "src/main/assets/materials/" + name + ".filamat";
        file.open(path, std::ios::binary | std::ios::ate);
    }
    if (!file.is_open()) {
        return nullptr;
    }
    std::streamsize size = file.tellg();
    file.seekg(0, std::ios::beg);
    std::vector<char> buffer(size);
    if (file.read(buffer.data(), size)) {
        return filament::Material::Builder().package(buffer.data(), size).build(engine);
    }
    return nullptr;
}

class ShaderManagerTesting {
public:
    static void setMaterials(ShaderManager& manager,
                             filament::Material* mat2D, filament::MaterialInstance* inst2D,
                             filament::Material* matExternal, filament::MaterialInstance* instExternal,
                             filament::Material* matDownsample, filament::MaterialInstance* instDownsample,
                             filament::Material* matBlurDown, filament::MaterialInstance* instBlurDown,
                             filament::Material* matBlurUp, filament::MaterialInstance* instBlurUp,
                             filament::Material* matComposite, filament::MaterialInstance* instComposite) {
        manager.material2D = mat2D;
        manager.materialInstance2D = inst2D;
        manager.materialExternal = matExternal;
        manager.materialInstanceExternal = instExternal;
        manager.materialDownsample = matDownsample;
        manager.materialInstanceDownsample = instDownsample;
        manager.materialBlurDown = matBlurDown;
        manager.materialInstanceBlurDown = instBlurDown;
        manager.materialBlurUp = matBlurUp;
        manager.materialInstanceBlurUp = instBlurUp;
        manager.materialComposite = matComposite;
        manager.materialInstanceComposite = instComposite;
    }
};

TEST(FrameRendererTest, RenderFunctions_CheckValidation) {
    GrovkornetEngine engine(640, 480);
    engine.skipGlFlush = true;
    RenderState state;
    state.targetFps = 30;
    state.aspectRatio = 1;

    // Test that passing null parameters yields false
    bool resOffscreen = FrameRenderer::renderOffscreenFrame(engine, nullptr, nullptr, &state);
    EXPECT_FALSE(resOffscreen);

    bool resHb = FrameRenderer::renderHardwareBufferFrame(engine, nullptr, &state);
    EXPECT_FALSE(resHb);

    int actualFps = 0, stampedFps = 0;
    bool fpsUpdated = false;
    float mockUv[16] = {0};
    // Should fail because liveSwapChain is nullptr
    bool resLive = FrameRenderer::renderLiveFrame(engine, &state, mockUv, 640, 480, 640, 480, false, false, actualFps, stampedFps, fpsUpdated);
    EXPECT_FALSE(resLive);
}

TEST(FrameRendererTest, FullRenderLifecycle_Success) {
    // 1. Initialize NOOP engine
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    // 2. Load materials
    filament::Material* mat2D = loadMaterial(*engine, "FilmShader2D");
    filament::Material* matExternal = loadMaterial(*engine, "FilmShaderExternal");
    filament::Material* matDownsample = loadMaterial(*engine, "DownsampleShader");
    filament::Material* matBlurDown = loadMaterial(*engine, "BlurDownShader");
    filament::Material* matBlurUp = loadMaterial(*engine, "BlurUpShader");
    filament::Material* matComposite = loadMaterial(*engine, "CompositeShader");

    ASSERT_NE(mat2D, nullptr) << "Failed to load FilmShader2D.filamat";
    ASSERT_NE(matExternal, nullptr) << "Failed to load FilmShaderExternal.filamat";
    ASSERT_NE(matDownsample, nullptr) << "Failed to load DownsampleShader.filamat";
    ASSERT_NE(matBlurDown, nullptr) << "Failed to load BlurDownShader.filamat";
    ASSERT_NE(matBlurUp, nullptr) << "Failed to load BlurUpShader.filamat";
    ASSERT_NE(matComposite, nullptr) << "Failed to load CompositeShader.filamat";

    filament::MaterialInstance* inst2D = mat2D->createInstance();
    filament::MaterialInstance* instExternal = matExternal->createInstance();
    filament::MaterialInstance* instDownsample = matDownsample->createInstance();
    filament::MaterialInstance* instBlurDown = matBlurDown->createInstance();
    filament::MaterialInstance* instBlurUp = matBlurUp->createInstance();
    filament::MaterialInstance* instComposite = matComposite->createInstance();

    // Setup ShaderManager
    ShaderManager shaderManager;
    ShaderManagerTesting::setMaterials(shaderManager,
        mat2D, inst2D,
        matExternal, instExternal,
        matDownsample, instDownsample,
        matBlurDown, instBlurDown,
        matBlurUp, instBlurUp,
        matComposite, instComposite
    );

    // Setup Quad geometry
    filament::VertexBuffer* vb = nullptr;
    filament::IndexBuffer* ib = nullptr;
    GeometryBuilder::buildQuad(*engine, vb, ib);
    ASSERT_NE(vb, nullptr);
    ASSERT_NE(ib, nullptr);

    // Create camera
    utils::Entity cameraEntity = utils::EntityManager::get().create();
    filament::Camera* camera = engine->createCamera(cameraEntity);
    ASSERT_NE(camera, nullptr);

    // Create main GrovkornetEngine
    GrovkornetEngine gEngine(640, 480);
    gEngine.skipGlFlush = true;
    gEngine.engine = engine;
    gEngine.renderer = engine->createRenderer();
    gEngine.view = engine->createView();
    gEngine.scene = engine->createScene();
    gEngine.camera = camera;
    gEngine.vertexBuffer = vb;
    gEngine.indexBuffer = ib;
    gEngine.shaderManager = shaderManager;

    // View setup
    gEngine.view->setCamera(camera);
    gEngine.view->setScene(gEngine.scene);
    gEngine.view->setViewport(filament::Viewport(0, 0, 640, 480));

    // Initialize PipelineRenderer
    bool pipeInit = gEngine.pipelineRenderer.init(*engine, 640, 480, vb, ib, gEngine.shaderManager, camera);
    ASSERT_TRUE(pipeInit);

    // Initialize swapChains
    gEngine.swapChain = engine->createSwapChain(640, 480, filament::SwapChain::CONFIG_READABLE);
    gEngine.liveSwapChain = engine->createSwapChain(640, 480, filament::SwapChain::CONFIG_READABLE);
    ASSERT_NE(gEngine.swapChain, nullptr);
    ASSERT_NE(gEngine.liveSwapChain, nullptr);

    // Initialize LUT texture & dummy textures
    gEngine.lutTexture = filament::Texture::Builder()
        .width(LutGenerator::LUT_SIZE)
        .height(LutGenerator::LUT_SIZE)
        .depth(LutGenerator::LUT_SIZE)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_3D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);

    gEngine.overlayTexture = filament::Texture::Builder()
        .width(640)
        .height(480)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);

    gEngine.dummyBlackTexture = filament::Texture::Builder()
        .width(1)
        .height(1)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);

    ASSERT_NE(gEngine.lutTexture, nullptr);
    ASSERT_NE(gEngine.overlayTexture, nullptr);
    ASSERT_NE(gEngine.dummyBlackTexture, nullptr);

    // Upload dummy data
    static std::vector<uint32_t> dummyLutData(LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE, 0);
    filament::Texture::PixelBufferDescriptor dummyLutDesc(
        dummyLutData.data(), dummyLutData.size() * sizeof(uint32_t),
        filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
        [](void* buffer, size_t size, void* user) {}, nullptr
    );
    gEngine.lutTexture->setImage(*engine, 0, std::move(dummyLutDesc));

    static std::vector<uint32_t> dummyBlackData(1, 0);
    filament::Texture::PixelBufferDescriptor dummyBlackDesc(
        dummyBlackData.data(), dummyBlackData.size() * sizeof(uint32_t),
        filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
        [](void* buffer, size_t size, void* user) {}, nullptr
    );
    gEngine.dummyBlackTexture->setImage(*engine, 0, std::move(dummyBlackDesc));

    // Start background threads
    std::cout << "[TEST] Starting lutGenerator..." << std::endl;
    gEngine.lutGenerator.start();

    // 3. Test renderOffscreenFrame
    // Check validation paths
    RenderState state;
    state.renderParams.saturation = 1.2f;
    state.renderParams.contrast = 1.1f;
    state.targetFps = 60;
    state.aspectRatio = 1;
    state.renderParams.bloomIntensity = 0.5f; // Test bloom branch
    state.renderParams.panelY = 0.8f;         // Test panel Y branch

    std::vector<uint32_t> pixelsIn(640 * 480, 0xFFFFFFFF);
    std::vector<uint32_t> pixelsOut(640 * 480, 0);

    std::cout << "[TEST] Testing renderOffscreenFrame 1 (with bloom)..." << std::endl;
    bool res1 = FrameRenderer::renderOffscreenFrame(gEngine, pixelsIn.data(), pixelsOut.data(), &state);
    std::cout << "[TEST] renderOffscreenFrame 1 finished: " << res1 << std::endl;
    EXPECT_TRUE(res1);

    // Test without bloom & panel Y = 1.0f
    state.renderParams.bloomIntensity = 0.0f;
    state.renderParams.panelY = 1.0f;
    std::cout << "[TEST] Testing renderOffscreenFrame 2 (without bloom)..." << std::endl;
    bool res2 = FrameRenderer::renderOffscreenFrame(gEngine, pixelsIn.data(), pixelsOut.data(), &state);
    std::cout << "[TEST] renderOffscreenFrame 2 finished: " << res2 << std::endl;
    EXPECT_TRUE(res2);

    // 4. Test renderHardwareBufferFrame
    std::cout << "[TEST] Allocating AHardwareBuffer..." << std::endl;
    AHardwareBuffer* ahb = nullptr;
    AHardwareBuffer_Desc ahbDesc = {};
    ahbDesc.width = 640;
    ahbDesc.height = 480;
    ahbDesc.layers = 1;
    ahbDesc.format = AHARDWAREBUFFER_FORMAT_R8G8B8A8_UNORM;
    ahbDesc.usage = AHARDWAREBUFFER_USAGE_GPU_SAMPLED_IMAGE | AHARDWAREBUFFER_USAGE_GPU_COLOR_OUTPUT;

    int ahbAlloc = AHardwareBuffer_allocate(&ahbDesc, &ahb);
    std::cout << "[TEST] AHardwareBuffer_allocate finished: " << ahbAlloc << std::endl;
    ASSERT_EQ(ahbAlloc, 0);
    ASSERT_NE(ahb, nullptr);

    // Test hardware buffer rendering
    std::cout << "[TEST] Testing renderHardwareBufferFrame 1..." << std::endl;
    bool res3 = FrameRenderer::renderHardwareBufferFrame(gEngine, ahb, &state);
    std::cout << "[TEST] renderHardwareBufferFrame 1 finished: " << res3 << std::endl;
    EXPECT_TRUE(res3);

    // Test with bloom
    state.renderParams.bloomIntensity = 0.5f;
    std::cout << "[TEST] Testing renderHardwareBufferFrame 2 (with bloom)..." << std::endl;
    bool res4 = FrameRenderer::renderHardwareBufferFrame(gEngine, ahb, &state);
    std::cout << "[TEST] renderHardwareBufferFrame 2 finished: " << res4 << std::endl;
    EXPECT_TRUE(res4);

    AHardwareBuffer_release(ahb);

    // 5. Test renderLiveFrame
    // Setup inputTextureExternal
    gEngine.inputTextureExternal = filament::Texture::Builder()
        .width(640)
        .height(480)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);

    float mockUv[16] = {
        1.0f, 0.0f, 0.0f, 0.0f,
        0.0f, 1.0f, 0.0f, 0.0f,
        0.0f, 0.0f, 1.0f, 0.0f,
        0.0f, 0.0f, 0.0f, 1.0f
    };

    int actualFps = 0;
    int stampedFps = 0;
    bool fpsUpdated = false;

    // Happy path, skipScreenRender = false, isNewFrame = true
    std::cout << "[TEST] Testing renderLiveFrame 1..." << std::endl;
    bool resLive1 = FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated);
    std::cout << "[TEST] renderLiveFrame 1 finished: " << resLive1 << std::endl;
    EXPECT_TRUE(resLive1);

    // Call renderLiveFrame again immediately without resetting pacing -> should return false (shouldCapture returns false)
    bool resLivePacedOut = FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated);
    EXPECT_FALSE(resLivePacedOut);

    // Reset timing pacing to allow capturing subsequent frame instantly
    gEngine.timingController.reset();

    // skipScreenRender = true
    bool resLive2 = FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, true, true, actualFps, stampedFps, fpsUpdated);
    EXPECT_TRUE(resLive2);

    // Reset timing pacing to allow capturing subsequent frame instantly
    gEngine.timingController.reset();

    // isNewFrame = false, without bloom
    state.renderParams.bloomIntensity = 0.0f;
    bool resLive3 = FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, false, false, actualFps, stampedFps, fpsUpdated);
    EXPECT_TRUE(resLive3);

    // Test validation and fallback paths in FrameRenderer using fully initialized gEngine
    // 1. Offscreen render validation paths
    EXPECT_FALSE(FrameRenderer::renderOffscreenFrame(gEngine, nullptr, pixelsOut.data(), &state));
    EXPECT_FALSE(FrameRenderer::renderOffscreenFrame(gEngine, pixelsIn.data(), nullptr, &state));

    // 2. Hardware buffer render validation path
    EXPECT_FALSE(FrameRenderer::renderHardwareBufferFrame(gEngine, nullptr, &state));

    // 3. Live frame render validation paths
    EXPECT_FALSE(FrameRenderer::renderLiveFrame(gEngine, &state, nullptr, 640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated));
    
    filament::SwapChain* tempLiveSwapChain = gEngine.liveSwapChain;
    gEngine.liveSwapChain = nullptr;
    EXPECT_FALSE(FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated));
    gEngine.liveSwapChain = tempLiveSwapChain;

    // 4. Test Viewport width/height fallback branch (viewportWidth/Height <= 0)
    gEngine.viewportWidth = 0;
    gEngine.viewportHeight = 0;
    gEngine.timingController.reset();
    bool resViewportFallback = FrameRenderer::renderLiveFrame(gEngine, &state, mockUv, 640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated);
    EXPECT_TRUE(resViewportFallback);

    // Clean up cameraEntity (GrovkornetEngine destructor does not destroy cameraEntity entity registry)
    engine->destroy(cameraEntity);
    utils::EntityManager::get().destroy(cameraEntity);

    // Destroying gEngine will automatically release its allocated resources
}
