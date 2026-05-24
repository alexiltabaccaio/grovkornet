#include "ShaderManager.h"
#include <android/log.h>
#include <android/log.h>
#include <vector>

#define LOG_TAG "ShaderManager"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

ShaderManager::ShaderManager() {}

ShaderManager::~ShaderManager() {}

bool ShaderManager::loadFromAsset(
    filament::Engine& engine, 
    AAssetManager* assetManager,
    const std::string& assetName, 
    filament::Material*& outMaterial, 
    filament::MaterialInstance*& outInstance
) {
    if (!assetManager) {
        LOGE("AAssetManager is null!");
        return false;
    }

    std::string path = "materials/" + assetName + ".filamat";
    AAsset* asset = AAssetManager_open(assetManager, path.c_str(), AASSET_MODE_BUFFER);
    if (!asset) {
        LOGE("Failed to open asset: %s", path.c_str());
        return false;
    }

    off_t size = AAsset_getLength(asset);
    std::vector<uint8_t> buffer(size);
    AAsset_read(asset, buffer.data(), size);
    AAsset_close(asset);

    outMaterial = filament::Material::Builder().package(buffer.data(), buffer.size()).build(engine);
    if (!outMaterial) {
        LOGE("Failed to build material from asset: %s", path.c_str());
        return false;
    }

    outInstance = outMaterial->createInstance();
    return outInstance != nullptr;
}

bool ShaderManager::init(filament::Engine& engine, AAssetManager* assetManager) {
    if (!loadFromAsset(engine, assetManager, "FilmShader2D", material2D, materialInstance2D)) return false;
    if (!loadFromAsset(engine, assetManager, "FilmShaderExternal", materialExternal, materialInstanceExternal)) return false;
    if (!loadFromAsset(engine, assetManager, "DownsampleShader", materialDownsample, materialInstanceDownsample)) return false;
    if (!loadFromAsset(engine, assetManager, "BlurDownShader", materialBlurDown, materialInstanceBlurDown)) return false;
    if (!loadFromAsset(engine, assetManager, "BlurUpShader", materialBlurUp, materialInstanceBlurUp)) return false;
    if (!loadFromAsset(engine, assetManager, "CompositeShader", materialComposite, materialInstanceComposite)) return false;

    return true;
}

void ShaderManager::destroy(filament::Engine& engine) {
    if (materialInstance2D) engine.destroy(materialInstance2D);
    if (material2D) engine.destroy(material2D);
    
    if (materialInstanceExternal) engine.destroy(materialInstanceExternal);
    if (materialExternal) engine.destroy(materialExternal);
    
    if (materialInstanceDownsample) engine.destroy(materialInstanceDownsample);
    if (materialDownsample) engine.destroy(materialDownsample);
    
    if (materialInstanceBlurDown) engine.destroy(materialInstanceBlurDown);
    if (materialBlurDown) engine.destroy(materialBlurDown);
    
    if (materialInstanceBlurUp) engine.destroy(materialInstanceBlurUp);
    if (materialBlurUp) engine.destroy(materialBlurUp);
    
    if (materialInstanceComposite) engine.destroy(materialInstanceComposite);
    if (materialComposite) engine.destroy(materialComposite);

    materialInstance2D = nullptr;
    material2D = nullptr;
    materialInstanceExternal = nullptr;
    materialExternal = nullptr;
    materialInstanceDownsample = nullptr;
    materialDownsample = nullptr;
    materialInstanceBlurDown = nullptr;
    materialBlurDown = nullptr;
    materialInstanceBlurUp = nullptr;
    materialBlurUp = nullptr;
    materialInstanceComposite = nullptr;
    materialComposite = nullptr;
}
