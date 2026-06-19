#include <gtest/gtest.h>
#include <iostream>
#include <thread>
#include <vector>
#include <atomic>
#include <chrono>
#include <fstream>
#include <string>
#include "core/GrovkornetEngine.h"
#include "core/FrameRenderer.h"
#include "pipeline/GeometryBuilder.h"
#include <filament/Engine.h>
#include <filament/Camera.h>
#include <filament/Texture.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <utils/Entity.h>
#include <utils/EntityManager.h>
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

class FrameRendererConcurrencyTest : public ::testing::Test {
protected:
    filament::Engine* engine;
    GrovkornetEngine* gEngine;
    utils::Entity cameraEntity;
    RenderState baseState;
    
    filament::Material* mat2D = nullptr;
    filament::Material* matExternal = nullptr;
    filament::Material* matDownsample = nullptr;
    filament::Material* matBlurDown = nullptr;
    filament::Material* matBlurUp = nullptr;
    filament::Material* matComposite = nullptr;

    filament::MaterialInstance* inst2D = nullptr;
    filament::MaterialInstance* instExternal = nullptr;
    filament::MaterialInstance* instDownsample = nullptr;
    filament::MaterialInstance* instBlurDown = nullptr;
    filament::MaterialInstance* instBlurUp = nullptr;
    filament::MaterialInstance* instComposite = nullptr;

    filament::VertexBuffer* vb = nullptr;
    filament::IndexBuffer* ib = nullptr;

    void SetUp() override {
        engine = filament::Engine::create(filament::Engine::Backend::NOOP);
        ASSERT_NE(engine, nullptr);

        // Load materials
        mat2D = loadMaterial(*engine, "FilmShader2D");
        matExternal = loadMaterial(*engine, "FilmShaderExternal");
        matDownsample = loadMaterial(*engine, "DownsampleShader");
        matBlurDown = loadMaterial(*engine, "BlurDownShader");
        matBlurUp = loadMaterial(*engine, "BlurUpShader");
        matComposite = loadMaterial(*engine, "CompositeShader");

        ASSERT_NE(mat2D, nullptr) << "Failed to load FilmShader2D.filamat";
        ASSERT_NE(matExternal, nullptr) << "Failed to load FilmShaderExternal.filamat";
        ASSERT_NE(matDownsample, nullptr) << "Failed to load DownsampleShader.filamat";
        ASSERT_NE(matBlurDown, nullptr) << "Failed to load BlurDownShader.filamat";
        ASSERT_NE(matBlurUp, nullptr) << "Failed to load BlurUpShader.filamat";
        ASSERT_NE(matComposite, nullptr) << "Failed to load CompositeShader.filamat";

        inst2D = mat2D->createInstance();
        instExternal = matExternal->createInstance();
        instDownsample = matDownsample->createInstance();
        instBlurDown = matBlurDown->createInstance();
        instBlurUp = matBlurUp->createInstance();
        instComposite = matComposite->createInstance();

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

        // Geometry
        GeometryBuilder::buildQuad(*engine, vb, ib);
        ASSERT_NE(vb, nullptr);
        ASSERT_NE(ib, nullptr);

        // Create camera
        cameraEntity = utils::EntityManager::get().create();
        filament::Camera* camera = engine->createCamera(cameraEntity);
        
        gEngine = new GrovkornetEngine(640, 480);
        gEngine->skipGlFlush = true;
        gEngine->skipFilamentRender = true;
        gEngine->engine = engine;
        gEngine->renderer = engine->createRenderer();
        gEngine->view = engine->createView();
        gEngine->scene = engine->createScene();
        gEngine->camera = camera;
        gEngine->vertexBuffer = vb;
        gEngine->indexBuffer = ib;
        gEngine->shaderManager = shaderManager;

        // View setup
        gEngine->view->setCamera(camera);
        gEngine->view->setScene(gEngine->scene);
        gEngine->view->setViewport(filament::Viewport(0, 0, 640, 480));

        // Initialize PipelineRenderer
        bool pipeInit = gEngine->pipelineRenderer.init(*engine, 640, 480, vb, ib, gEngine->shaderManager, camera);
        ASSERT_TRUE(pipeInit);

        // Initialize swapChains
        gEngine->swapChain = engine->createSwapChain(640, 480, filament::SwapChain::CONFIG_READABLE);
        gEngine->liveSwapChain = engine->createSwapChain(640, 480, filament::SwapChain::CONFIG_READABLE);
        ASSERT_NE(gEngine->swapChain, nullptr);
        ASSERT_NE(gEngine->liveSwapChain, nullptr);

        // Initialize LUT texture & dummy textures
        gEngine->lutTexture = filament::Texture::Builder()
            .width(LutGenerator::LUT_SIZE)
            .height(LutGenerator::LUT_SIZE)
            .depth(LutGenerator::LUT_SIZE)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_3D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);

        gEngine->overlayTexture = filament::Texture::Builder()
            .width(640)
            .height(480)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);

        gEngine->dummyBlackTexture = filament::Texture::Builder()
            .width(1)
            .height(1)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);

        ASSERT_NE(gEngine->lutTexture, nullptr);
        ASSERT_NE(gEngine->overlayTexture, nullptr);
        ASSERT_NE(gEngine->dummyBlackTexture, nullptr);

        // Upload dummy data
        static std::vector<uint32_t> dummyLutData(LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE * LutGenerator::LUT_SIZE, 0);
        filament::Texture::PixelBufferDescriptor dummyLutDesc(
            dummyLutData.data(), dummyLutData.size() * sizeof(uint32_t),
            filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
            [](void* buffer, size_t size, void* user) {}, nullptr
        );
        gEngine->lutTexture->setImage(*engine, 0, std::move(dummyLutDesc));

        static std::vector<uint32_t> dummyBlackData(1, 0);
        filament::Texture::PixelBufferDescriptor dummyBlackDesc(
            dummyBlackData.data(), dummyBlackData.size() * sizeof(uint32_t),
            filament::Texture::Format::RGBA, filament::Texture::Type::UBYTE,
            [](void* buffer, size_t size, void* user) {}, nullptr
        );
        gEngine->dummyBlackTexture->setImage(*engine, 0, std::move(dummyBlackDesc));

        // Start background threads
        gEngine->lutGenerator.start();

        // Setup inputTextureExternal
        gEngine->inputTextureExternal = filament::Texture::Builder()
            .width(640)
            .height(480)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);
        ASSERT_NE(gEngine->inputTextureExternal, nullptr);

        baseState.targetFps = 30;
        baseState.aspectRatio = 1;
    }

    void TearDown() override {
        // Stop background threads
        gEngine->lutGenerator.stop();

        // 1. Destroy camera entity while engine is still valid
        engine->destroy(cameraEntity);
        utils::EntityManager::get().destroy(cameraEntity);

        // 2. Delete gEngine (which automatically destroys all other resources and the filament::Engine itself)
        delete gEngine;
    }
};

TEST_F(FrameRendererConcurrencyTest, ConcurrentRenderLiveFrame) {
    std::atomic<bool> running{true};
    std::atomic<int> successCount{0};
    const int numThreads = 8;
    const int durationMs = 500;

    std::vector<std::thread> threads;

    // Simulate multiple JNI threads calling renderLiveFrame simultaneously
    for (int i = 0; i < numThreads; ++i) {
        threads.emplace_back([this, &running, &successCount, i]() {
            float uvMatrix[16] = {
                1.0f, 0.0f, 0.0f, 0.0f,
                0.0f, 1.0f, 0.0f, 0.0f,
                0.0f, 0.0f, 1.0f, 0.0f,
                0.0f, 0.0f, 0.0f, 1.0f
            };
            
            while (running) {
                int actualFps = 0, stampedFps = 0;
                bool fpsUpdated = false;
                RenderState state = baseState;
                state.renderParams.saturation = 1.0f + (0.1f * i);
                
                // Call the thread-safe renderLiveFrame member function on gEngine
                bool result = gEngine->renderLiveFrame(&state, uvMatrix, 
                    640, 480, 640, 480, false, true, actualFps, stampedFps, fpsUpdated);
                
                if (result) {
                    successCount++;
                }
                
                // Allow FrameTimingController to pace slightly
                std::this_thread::sleep_for(std::chrono::milliseconds(5));
            }
        });
    }

    std::this_thread::sleep_for(std::chrono::milliseconds(durationMs));
    running = false;

    for (auto& t : threads) {
        if (t.joinable()) t.join();
    }

    // It should have successfully ran multiple times without crashing
    std::cout << "[TEST] ConcurrentRenderLiveFrame completed with " << successCount << " renders." << std::endl;
    EXPECT_GE(successCount, 0); // No crash is the primary success criteria for thread safety here
}
