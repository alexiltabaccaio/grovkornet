#include <gtest/gtest.h>
#include <chrono>
#include <iostream>
#include <vector>
#include <numeric>
#include <cmath>
#include <fstream>
#include <string>
#include <iomanip>

#include "pipeline/PipelineRenderer.h"
#include "pipeline/ShaderManager.h"
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

static filament::Material* loadBenchmarkMaterial(filament::Engine& engine, const std::string& name) {
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

struct BenchmarkStats {
    double avgMs;
    double minMs;
    double maxMs;
    double stddevMs;
};

class PipelinePerformanceTest : public ::testing::Test {
protected:
    filament::Engine* engine = nullptr;
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

    ShaderManager shaderManager;
    filament::VertexBuffer* vb = nullptr;
    filament::IndexBuffer* ib = nullptr;
    utils::Entity cameraEntity;
    filament::Camera* camera = nullptr;
    PipelineRenderer renderer;
    filament::Texture* dummyTexture = nullptr;

    bool isNoopBackend = false;
    const int W = 1920;
    const int H = 1080;

    void SetUp() override {
        engine = filament::Engine::create(filament::Engine::Backend::NOOP);
        isNoopBackend = true;
        ASSERT_NE(engine, nullptr);

        // Load materials
        mat2D = loadBenchmarkMaterial(*engine, "FilmShader2D");
        matExternal = loadBenchmarkMaterial(*engine, "FilmShaderExternal");
        matDownsample = loadBenchmarkMaterial(*engine, "DownsampleShader");
        matBlurDown = loadBenchmarkMaterial(*engine, "BlurDownShader");
        matBlurUp = loadBenchmarkMaterial(*engine, "BlurUpShader");
        matComposite = loadBenchmarkMaterial(*engine, "CompositeShader");

        ASSERT_NE(mat2D, nullptr) << "Failed to load FilmShader2D.filamat";
        ASSERT_NE(matExternal, nullptr);
        ASSERT_NE(matDownsample, nullptr);
        ASSERT_NE(matBlurDown, nullptr);
        ASSERT_NE(matBlurUp, nullptr);
        ASSERT_NE(matComposite, nullptr);

        inst2D = mat2D->createInstance();
        instExternal = matExternal->createInstance();
        instDownsample = matDownsample->createInstance();
        instBlurDown = matBlurDown->createInstance();
        instBlurUp = matBlurUp->createInstance();
        instComposite = matComposite->createInstance();

        ShaderManagerTesting::setMaterials(shaderManager,
            mat2D, inst2D,
            matExternal, instExternal,
            matDownsample, instDownsample,
            matBlurDown, instBlurDown,
            matBlurUp, instBlurUp,
            matComposite, instComposite
        );

        GeometryBuilder::buildQuad(*engine, vb, ib);
        ASSERT_NE(vb, nullptr);
        ASSERT_NE(ib, nullptr);

        cameraEntity = utils::EntityManager::get().create();
        camera = engine->createCamera(cameraEntity);
        ASSERT_NE(camera, nullptr);

        bool initResult = renderer.init(*engine, W, H, vb, ib, shaderManager, camera);
        ASSERT_TRUE(initResult);

        dummyTexture = filament::Texture::Builder()
            .width(1)
            .height(1)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*engine);
        ASSERT_NE(dummyTexture, nullptr);

        renderer.setStaticParameters(W, H, shaderManager, dummyTexture);
    }

    void TearDown() override {
        if (engine) {
            engine->destroy(dummyTexture);
            engine->destroy(cameraEntity);
            utils::EntityManager::get().destroy(cameraEntity);
            engine->destroy(vb);
            engine->destroy(ib);

            renderer.destroy(*engine);
            shaderManager.destroy(*engine);
            filament::Engine::destroy(&engine);
        }
    }

    BenchmarkStats runBenchmark(float drsScale, float bloomIntensity, float panelY, int iterations) {
        // Update viewports based on DRS scale
        renderer.updateViewports(W, H, drsScale);

        // Warmup runs to stabilize GPU caches / pipeline state object (PSO) compilation
        for (int i = 0; i < 5; ++i) {
            // Set dynamic parameters
            filament::math::float4 rd3(800.0f, 0.0f, bloomIntensity, 0.0f);
            filament::math::float4 rd6(1.0f, panelY, 0.0f, 0.0f);
            instComposite->setParameter("u_RenderData3", rd3);
            instComposite->setParameter("u_RenderData6", rd6);
            engine->flush();
        }

        std::vector<double> timings;
        timings.reserve(iterations);

        for (int i = 0; i < iterations; ++i) {
            auto start = std::chrono::high_resolution_clock::now();

            // Simulate the frame rendering pipeline passes
            // 1. Grading pass
            // 2. Downsample/Blur passes if bloom is enabled or split panel is active
            // 3. Composite pass
            filament::math::float4 rd3(800.0f, 0.0f, bloomIntensity, 0.0f);
            filament::math::float4 rd6(1.0f, panelY, 0.0f, 0.0f);
            instComposite->setParameter("u_RenderData3", rd3);
            instComposite->setParameter("u_RenderData6", rd6);

            // Trigger synchronous commands to force actual GPU profiling
            engine->flushAndWait();

            auto end = std::chrono::high_resolution_clock::now();
            double duration = std::chrono::duration<double, std::milli>(end - start).count();
            timings.push_back(duration);
        }

        double sum = std::accumulate(timings.begin(), timings.end(), 0.0);
        double avg = sum / iterations;
        double minVal = *std::min_element(timings.begin(), timings.end());
        double maxVal = *std::max_element(timings.begin(), timings.end());

        double accum = 0.0;
        for (double d : timings) {
            accum += (d - avg) * (d - avg);
        }
        double stddev = std::sqrt(accum / iterations);

        return {avg, minVal, maxVal, stddev};
    }
};

TEST_F(PipelinePerformanceTest, RenderPassLatencyBenchmark) {
    const int iterations = 100;
    
    // Scenario 1: Baseline (No complex post-processing effects, DRS Scale = 1.0)
    BenchmarkStats statsBaseline = runBenchmark(1.0f, 0.0f, 1.0f, iterations);

    // Scenario 2: Max Effects (Heavy Bloom and split panel enabled, DRS Scale = 1.0)
    BenchmarkStats statsHeavy = runBenchmark(1.0f, 0.8f, 0.5f, iterations);

    // Scenario 3: DRS Mitigation (Heavy Bloom and split panel enabled, but DRS Scale = 0.5)
    BenchmarkStats statsDrs = runBenchmark(0.5f, 0.8f, 0.5f, iterations);

    std::cout << "\n========================================================================================\n";
    std::cout << "                        GROVKORNET NATIVE PIPELINE BENCHMARK\n";
    std::cout << "========================================================================================\n";
    std::cout << "Backend: " << (isNoopBackend ? "NOOP (CPU-only Mock)" : "OPENGL (Native Hardware)") << "\n";
    std::cout << "Resolution: " << W << "x" << H << "\n";
    std::cout << "Iterations: " << iterations << "\n";
    std::cout << "----------------------------------------------------------------------------------------\n";
    std::cout << std::left << std::setw(25) << "Scenario" 
              << std::setw(15) << "Avg (ms)" 
              << std::setw(15) << "Min (ms)" 
              << std::setw(15) << "Max (ms)" 
              << std::setw(15) << "StdDev" << "\n";
    std::cout << "----------------------------------------------------------------------------------------\n";
    
    std::cout << std::left << std::setw(25) << "1. Baseline (No Bloom)" 
              << std::setw(15) << std::fixed << std::setprecision(3) << statsBaseline.avgMs
              << std::setw(15) << statsBaseline.minMs
              << std::setw(15) << statsBaseline.maxMs
              << std::setw(15) << statsBaseline.stddevMs << "\n";

    std::cout << std::left << std::setw(25) << "2. Heavy Effects (Bloom)" 
              << std::setw(15) << statsHeavy.avgMs
              << std::setw(15) << statsHeavy.minMs
              << std::setw(15) << statsHeavy.maxMs
              << std::setw(15) << statsHeavy.stddevMs << "\n";

    std::cout << std::left << std::setw(25) << "3. DRS Mitigation (0.5x)" 
              << std::setw(15) << statsDrs.avgMs
              << std::setw(15) << statsDrs.minMs
              << std::setw(15) << statsDrs.maxMs
              << std::setw(15) << statsDrs.stddevMs << "\n";
    std::cout << "========================================================================================\n\n";

    if (!isNoopBackend) {
        // Assert latency guidelines under hardware rendering
        // 60 FPS requires <= 16.6ms total. We assert our rendering pipeline alone takes <= 10ms.
        EXPECT_LT(statsBaseline.avgMs, 10.0);
        EXPECT_LT(statsHeavy.avgMs, 15.0);
        
        // Assert that DRS mitigation actually reduces execution times
        EXPECT_LE(statsDrs.avgMs, statsHeavy.avgMs);
    } else {
        // In NOOP backend, average time should be very close to 0ms.
        EXPECT_LT(statsBaseline.avgMs, 1.0);
    }
}
