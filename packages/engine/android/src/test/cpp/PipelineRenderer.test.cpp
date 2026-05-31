#include <gtest/gtest.h>
#include "pipeline/PipelineRenderer.h"
#include "pipeline/ShaderManager.h"
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

// Test helper class to access private fields of ShaderManager
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

static filament::Material* loadMaterial(filament::Engine& engine, const std::string& name) {
    std::string path = "/data/local/tmp/materials/" + name + ".filamat";
    std::ifstream file(path, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        // Local fallback
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

TEST(PipelineRendererTest, FullPipelineLifecycle) {
    // 1. Initialize NOOP engine
    filament::Engine* engine = filament::Engine::create(filament::Engine::Backend::NOOP);
    ASSERT_NE(engine, nullptr);

    // 2. Load and build materials
    filament::Material* mat2D = loadMaterial(*engine, "FilmShader2D");
    filament::Material* matExternal = loadMaterial(*engine, "FilmShaderExternal");
    filament::Material* matDownsample = loadMaterial(*engine, "DownsampleShader");
    filament::Material* matBlurDown = loadMaterial(*engine, "BlurDownShader");
    filament::Material* matBlurUp = loadMaterial(*engine, "BlurUpShader");
    filament::Material* matComposite = loadMaterial(*engine, "CompositeShader");

    ASSERT_NE(mat2D, nullptr) << "Failed to load FilmShader2D.filamat";
    ASSERT_NE(matExternal, nullptr);
    ASSERT_NE(matDownsample, nullptr);
    ASSERT_NE(matBlurDown, nullptr);
    ASSERT_NE(matBlurUp, nullptr);
    ASSERT_NE(matComposite, nullptr);

    filament::MaterialInstance* inst2D = mat2D->createInstance();
    filament::MaterialInstance* instExternal = matExternal->createInstance();
    filament::MaterialInstance* instDownsample = matDownsample->createInstance();
    filament::MaterialInstance* instBlurDown = matBlurDown->createInstance();
    filament::MaterialInstance* instBlurUp = matBlurUp->createInstance();
    filament::MaterialInstance* instComposite = matComposite->createInstance();

    // 3. Setup ShaderManager with loaded materials
    ShaderManager shaderManager;
    ShaderManagerTesting::setMaterials(shaderManager,
        mat2D, inst2D,
        matExternal, instExternal,
        matDownsample, instDownsample,
        matBlurDown, instBlurDown,
        matBlurUp, instBlurUp,
        matComposite, instComposite
    );

    // 4. Create quad geometry and camera
    filament::VertexBuffer* vb = nullptr;
    filament::IndexBuffer* ib = nullptr;
    GeometryBuilder::buildQuad(*engine, vb, ib);
    ASSERT_NE(vb, nullptr);
    ASSERT_NE(ib, nullptr);

    utils::Entity cameraEntity = utils::EntityManager::get().create();
    filament::Camera* camera = engine->createCamera(cameraEntity);
    ASSERT_NE(camera, nullptr);

    // 5. Initialize PipelineRenderer
    PipelineRenderer renderer;
    bool initResult = renderer.init(*engine, 1920, 1080, vb, ib, shaderManager, camera);
    EXPECT_TRUE(initResult);

    // Verify views/scenes were created
    EXPECT_NE(renderer.viewGrading, nullptr);
    EXPECT_NE(renderer.sceneGrading, nullptr);
    EXPECT_NE(renderer.viewDownsample, nullptr);
    EXPECT_NE(renderer.sceneDownsample, nullptr);
    EXPECT_NE(renderer.viewBlurDown, nullptr);
    EXPECT_NE(renderer.sceneBlurDown, nullptr);
    EXPECT_NE(renderer.viewBlurUp, nullptr);
    EXPECT_NE(renderer.sceneBlurUp, nullptr);

    // 6. Test viewport updates
    renderer.updateViewports(1920, 1080, 0.75f);

    // 7. Test static parameters setup
    filament::Texture* dummyTexture = filament::Texture::Builder()
        .width(1)
        .height(1)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
    ASSERT_NE(dummyTexture, nullptr);

    renderer.setStaticParameters(1920, 1080, shaderManager, dummyTexture);

    // 8. Clean up renderer resources
    renderer.destroy(*engine);

    // 9. Clean up test resources
    engine->destroy(dummyTexture);
    engine->destroy(cameraEntity);
    utils::EntityManager::get().destroy(cameraEntity);
    engine->destroy(vb);
    engine->destroy(ib);

    // Destroy loaded materials & instances (destroyed by shaderManager.destroy or manually)
    shaderManager.destroy(*engine);
    filament::Engine::destroy(&engine);
}
