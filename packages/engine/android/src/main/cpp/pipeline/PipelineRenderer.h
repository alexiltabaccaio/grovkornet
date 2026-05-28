#pragma once
#include <filament/Engine.h>
#include <filament/View.h>
#include <filament/Scene.h>
#include <filament/Texture.h>
#include <filament/RenderTarget.h>
#include <filament/VertexBuffer.h>
#include <filament/IndexBuffer.h>
#include <filament/Renderer.h>
#include <utils/Entity.h>

#include "pipeline/ShaderManager.h"

class PipelineRenderer {
public:
    // Multi-pass pipeline views and scenes
    filament::View* viewGrading = nullptr;
    filament::Scene* sceneGrading = nullptr;
    
    filament::View* viewDownsample = nullptr;
    filament::Scene* sceneDownsample = nullptr;
    
    filament::View* viewBlurDown = nullptr;
    filament::Scene* sceneBlurDown = nullptr;
    
    filament::View* viewBlurUp = nullptr;
    filament::Scene* sceneBlurUp = nullptr;
    

    // Geometry entities
    utils::Entity quadGrading;
    utils::Entity quadDownsample;
    utils::Entity quadBlurDown;
    utils::Entity quadBlurUp;
    utils::Entity quadComposite;
    

    // Textures & Render Targets
    filament::Texture* gradedTexture = nullptr;
    filament::RenderTarget* gradedRenderTarget = nullptr;
    
    filament::Texture* bloomTexDown = nullptr;
    filament::RenderTarget* bloomDownRenderTarget = nullptr;
    
    filament::Texture* bloomTexBlur = nullptr;
    filament::RenderTarget* bloomBlurRenderTarget = nullptr;
    
    filament::Texture* bloomTexUp = nullptr;
    filament::RenderTarget* bloomUpRenderTarget = nullptr;


    bool init(filament::Engine& engine, int width, int height,
              filament::VertexBuffer* vertexBuffer, filament::IndexBuffer* indexBuffer,
              ShaderManager& shaderManager, filament::Camera* camera);
              
    void destroy(filament::Engine& engine);
    
    void updateViewports(int width, int height, float drsScale);
    
    void setStaticParameters(int width, int height, ShaderManager& shaderManager, filament::Texture* dummyBlackTexture);
};
