#include "pipeline/PipelineRenderer.h"
#include "pipeline/GeometryBuilder.h"
#include <utils/EntityManager.h>
#include <filament/Viewport.h>
#include <filament/TextureSampler.h>
#include <android/log.h>
#include <algorithm>

#define LOG_TAG "PipelineRenderer"
#ifdef NDEBUG
#define LOGI(...) ((void)0)
#else
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#endif
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

bool PipelineRenderer::init(filament::Engine& engine, int width, int height,
                          filament::VertexBuffer* vertexBuffer, filament::IndexBuffer* indexBuffer,
                          ShaderManager& shaderManager, filament::Camera* camera) {
    // 1. Create scenes
    sceneGrading = engine.createScene();
    sceneDownsample = engine.createScene();
    sceneBlurDown = engine.createScene();
    sceneBlurUp = engine.createScene();
    
    // 2. Create views
    viewGrading = engine.createView();
    viewDownsample = engine.createView();
    viewBlurDown = engine.createView();
    viewBlurUp = engine.createView();
    
    // Configure views
    auto configView = [&](filament::View* view, filament::Scene* scene, const char* name) {
        if (!view) return;
        view->setName(name);
        view->setScene(scene);
        view->setCamera(camera);
        view->setPostProcessingEnabled(false);
    };
    
    if (!viewGrading || !viewDownsample || !viewBlurDown || !viewBlurUp) {
        LOGE("Failed to create one or more pipeline views. Hardware limits reached?");
        return false;
    }
    
    configView(viewGrading, sceneGrading, "GradingPass");
    configView(viewDownsample, sceneDownsample, "DownsamplePass");
    configView(viewBlurDown, sceneBlurDown, "BlurDownPass");
    configView(viewBlurUp, sceneBlurUp, "BlurUpPass");
    
    // 3. Create textures and render targets
    // Bloom textures
    gradedTexture = filament::Texture::Builder()
        .width(width)
        .height(height)
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexDown = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexBlur = filament::Texture::Builder()
        .width(std::max(1, width / 8))
        .height(std::max(1, height / 8))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    bloomTexUp = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(engine);
        
    if (!gradedTexture || !bloomTexDown || !bloomTexBlur || !bloomTexUp) {
        LOGE("Failed to create pipeline textures");
        return false;
    }

    // Render Targets
    gradedRenderTarget = filament::RenderTarget::Builder().texture(filament::RenderTarget::AttachmentPoint::COLOR, gradedTexture).build(engine);
    bloomDownRenderTarget = filament::RenderTarget::Builder().texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexDown).build(engine);
    bloomBlurRenderTarget = filament::RenderTarget::Builder().texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexBlur).build(engine);
    bloomUpRenderTarget = filament::RenderTarget::Builder().texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexUp).build(engine);
    
    if (!gradedRenderTarget || !bloomDownRenderTarget || !bloomBlurRenderTarget || !bloomUpRenderTarget) {
        LOGE("Failed to create pipeline render targets");
        return false;
    }
    
    viewGrading->setRenderTarget(gradedRenderTarget);
    viewDownsample->setRenderTarget(bloomDownRenderTarget);
    viewBlurDown->setRenderTarget(bloomBlurRenderTarget);
    viewBlurUp->setRenderTarget(bloomUpRenderTarget);
    
    // 4. Create quad entities
    quadGrading = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstance2D());
    quadDownsample = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceDownsample());
    quadBlurDown = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurDown());
    quadBlurUp = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceBlurUp());
    quadComposite = GeometryBuilder::createQuadEntity(engine, vertexBuffer, indexBuffer, shaderManager.getMaterialInstanceComposite());
    
    // Add entities to scenes
    sceneGrading->addEntity(quadGrading);
    sceneDownsample->addEntity(quadDownsample);
    sceneBlurDown->addEntity(quadBlurDown);
    sceneBlurUp->addEntity(quadBlurUp);
    
    return true;
}

void PipelineRenderer::destroy(filament::Engine& engine) {
    if (viewGrading) engine.destroy(viewGrading);
    if (viewDownsample) engine.destroy(viewDownsample);
    if (viewBlurDown) engine.destroy(viewBlurDown);
    if (viewBlurUp) engine.destroy(viewBlurUp);
    
    if (sceneGrading) engine.destroy(sceneGrading);
    if (sceneDownsample) engine.destroy(sceneDownsample);
    if (sceneBlurDown) engine.destroy(sceneBlurDown);
    if (sceneBlurUp) engine.destroy(sceneBlurUp);
    
    engine.destroy(quadGrading);
    engine.destroy(quadDownsample);
    engine.destroy(quadBlurDown);
    engine.destroy(quadBlurUp);
    engine.destroy(quadComposite);
    
    utils::EntityManager::get().destroy(quadGrading);
    utils::EntityManager::get().destroy(quadDownsample);
    utils::EntityManager::get().destroy(quadBlurDown);
    utils::EntityManager::get().destroy(quadBlurUp);
    utils::EntityManager::get().destroy(quadComposite);
    
    if (gradedRenderTarget) engine.destroy(gradedRenderTarget);
    if (bloomDownRenderTarget) engine.destroy(bloomDownRenderTarget);
    if (bloomBlurRenderTarget) engine.destroy(bloomBlurRenderTarget);
    if (bloomUpRenderTarget) engine.destroy(bloomUpRenderTarget);
    
    if (gradedTexture) engine.destroy(gradedTexture);
    if (bloomTexDown) engine.destroy(bloomTexDown);
    if (bloomTexBlur) engine.destroy(bloomTexBlur);
    if (bloomTexUp) engine.destroy(bloomTexUp);
}

void PipelineRenderer::updateViewports(int width, int height, float drsScale) {
    int vWidth = static_cast<int>(width * drsScale);
    int vHeight = static_cast<int>(height * drsScale);
    
    viewGrading->setViewport(filament::Viewport(0, 0, vWidth, vHeight));
    viewDownsample->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
    viewBlurDown->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 8), std::max(1, vHeight / 8)));
    viewBlurUp->setViewport(filament::Viewport(0, 0, std::max(1, vWidth / 4), std::max(1, vHeight / 4)));
}

void PipelineRenderer::setStaticParameters(int width, int height, ShaderManager& shaderManager, filament::Texture* dummyBlackTexture) {
    filament::TextureSampler samplerLinear(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    
    shaderManager.getMaterialInstanceDownsample()->setParameter("u_Texture", gradedTexture, samplerLinear);
    
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_Texture", bloomTexDown, samplerLinear);
    shaderManager.getMaterialInstanceBlurDown()->setParameter("u_TexelSize", filament::math::float2(1.0f / std::max(1, width / 4), 1.0f / std::max(1, height / 4)));
    
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_Texture", bloomTexBlur, samplerLinear);
    shaderManager.getMaterialInstanceBlurUp()->setParameter("u_TexelSize", filament::math::float2(1.0f / std::max(1, width / 8), 1.0f / std::max(1, height / 8)));
    
    shaderManager.getMaterialInstanceComposite()->setParameter("u_Texture", gradedTexture, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_BloomTexture", bloomTexUp, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_OverlayTexture", dummyBlackTexture, samplerLinear);
    shaderManager.getMaterialInstanceComposite()->setParameter("u_GlassTexture", bloomTexUp, samplerLinear);
}
