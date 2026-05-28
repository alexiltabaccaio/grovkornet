#include "pipeline/ShaderManager.h"
#include <utils/Log.h>
#include <android/log.h>

#define LOG_TAG "ShaderManager"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

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

bool ShaderManager::loadFromAsset(
    filament::Engine& engine, 
    AAssetManager* assetManager,
    const char* name,
    filament::Material*& outMaterial,
    filament::MaterialInstance*& outInstance) {
    
    char path[256];
    snprintf(path, sizeof(path), "materials/%s.filamat", name);
    
    AAsset* asset = AAssetManager_open(assetManager, path, AASSET_MODE_BUFFER);
    if (!asset) {
        LOGE("Failed to open asset: %s", path);
        return false;
    }
    
    size_t length = AAsset_getLength(asset);
    const void* data = AAsset_getBuffer(asset);
    
    if (!data) {
        LOGE("Failed to read asset buffer: %s", path);
        AAsset_close(asset);
        return false;
    }
    
    filament::Material::Builder builder;
    builder.package(data, length);
    outMaterial = builder.build(engine);
    
    AAsset_close(asset);
    
    if (!outMaterial) {
        LOGE("Failed to build material: %s", path);
        return false;
    }
    
    outInstance = outMaterial->createInstance();
    if (!outInstance) {
        LOGE("Failed to create material instance: %s", path);
        return false;
    }
    
    return true;
}
