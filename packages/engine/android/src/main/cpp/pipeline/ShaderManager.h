#pragma once
#include <filament/Engine.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <android/asset_manager.h>

class ShaderManager {
public:
    friend class ShaderManagerTesting;

    bool init(filament::Engine& engine, AAssetManager* assetManager);
    void destroy(filament::Engine& engine);

    filament::MaterialInstance* getMaterialInstance2D() const { return materialInstance2D; }
    filament::MaterialInstance* getMaterialInstanceExternal() const { return materialInstanceExternal; }
    filament::MaterialInstance* getMaterialInstanceDownsample() const { return materialInstanceDownsample; }
    filament::MaterialInstance* getMaterialInstanceBlurDown() const { return materialInstanceBlurDown; }
    filament::MaterialInstance* getMaterialInstanceBlurUp() const { return materialInstanceBlurUp; }
    

    filament::MaterialInstance* getMaterialInstanceComposite() const { return materialInstanceComposite; }

private:
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

    bool loadFromAsset(
        filament::Engine& engine, 
        AAssetManager* assetManager,
        const char* name,
        filament::Material*& outMaterial,
        filament::MaterialInstance*& outInstance);
};
