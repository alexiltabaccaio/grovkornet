#include "grovkornet-engine.h"
#include <jni.h>
#include <android/log.h>
#include <android/bitmap.h>
#include <android/hardware_buffer.h>
#include <android/hardware_buffer_jni.h>
#include <cmath>
#include <algorithm>

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
#include <filament/RenderableManager.h>
#include <filament/TextureSampler.h>
#include <filament/RenderTarget.h>
#include <math/vec2.h>
#include <utils/EntityManager.h>
#include <filamat/MaterialBuilder.h>

#define LOG_TAG "GrovkornetEngine"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

GrovkornetEngine::GrovkornetEngine(int w, int h) : width(w), height(h) {
    lutBuffer.resize(LUT_SIZE * LUT_SIZE * LUT_SIZE * 4, 0);
    lutParametersDirty = true;
}

bool GrovkornetEngine::init() {
    LOGI("Initializing Filament Engine for size %dx%d...", width, height);
    
    // 1. Try Vulkan backend first, fallback to OpenGL ES 3.0
    engine = filament::Engine::create(filament::Engine::Backend::VULKAN);
    if (!engine) {
        LOGW("Failed to initialize Vulkan backend, falling back to OpenGL ES 3.0");
        engine = filament::Engine::create(filament::Engine::Backend::OPENGL);
    }
    
    if (!engine) {
        LOGE("Failed to create Filament Engine (both Vulkan and OpenGL failed)");
        return false;
    }
    
    renderer = engine->createRenderer();
    
    // Create views and scenes
    view = engine->createView();
    scene = engine->createScene();
    
    viewGrading = engine->createView();
    sceneGrading = engine->createScene();
    
    viewDownsample = engine->createView();
    sceneDownsample = engine->createScene();
    
    viewBlurDown = engine->createView();
    sceneBlurDown = engine->createScene();
    
    viewBlurUp = engine->createView();
    sceneBlurUp = engine->createScene();
    
    utils::Entity cameraEntity = utils::EntityManager::get().create();
    camera = engine->createCamera(cameraEntity);
    
    // Orthographic projection for 2D quads
    camera->setProjection(filament::Camera::Projection::ORTHO, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    
    // Set cameras and scenes for all views
    view->setCamera(camera);
    view->setScene(scene);
    view->setViewport(filament::Viewport(0, 0, width, height));
    view->setPostProcessingEnabled(false);
    
    viewGrading->setCamera(camera);
    viewGrading->setScene(sceneGrading);
    viewGrading->setViewport(filament::Viewport(0, 0, width, height));
    viewGrading->setPostProcessingEnabled(false);
    
    viewDownsample->setCamera(camera);
    viewDownsample->setScene(sceneDownsample);
    viewDownsample->setViewport(filament::Viewport(0, 0, std::max(1, width / 4), std::max(1, height / 4)));
    viewDownsample->setPostProcessingEnabled(false);
    
    viewBlurDown->setCamera(camera);
    viewBlurDown->setScene(sceneBlurDown);
    viewBlurDown->setViewport(filament::Viewport(0, 0, std::max(1, width / 8), std::max(1, height / 8)));
    viewBlurDown->setPostProcessingEnabled(false);
    
    viewBlurUp->setCamera(camera);
    viewBlurUp->setScene(sceneBlurUp);
    viewBlurUp->setViewport(filament::Viewport(0, 0, std::max(1, width / 4), std::max(1, height / 4)));
    viewBlurUp->setPostProcessingEnabled(false);
    
    swapChain = engine->createSwapChain(width, height, filament::SwapChain::CONFIG_READABLE);
    if (!swapChain) {
        LOGE("Failed to create headless SwapChain");
        return false;
    }
    
    // 2. Initialize intermediate textures
    gradedTexture = filament::Texture::Builder()
        .width(width)
        .height(height)
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexDown = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexBlur = filament::Texture::Builder()
        .width(std::max(1, width / 8))
        .height(std::max(1, height / 8))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    bloomTexUp = filament::Texture::Builder()
        .width(std::max(1, width / 4))
        .height(std::max(1, height / 4))
        .levels(1)
        .usage(filament::Texture::Usage::COLOR_ATTACHMENT | filament::Texture::Usage::SAMPLEABLE)
        .sampler(filament::Texture::Sampler::SAMPLER_2D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    if (!gradedTexture || !bloomTexDown || !bloomTexBlur || !bloomTexUp) {
        LOGE("Failed to create multi-pass textures");
        return false;
    }
    
    // Create RenderTargets
    gradedRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, gradedTexture)
        .build(*engine);
        
    bloomDownRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexDown)
        .build(*engine);
        
    bloomBlurRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexBlur)
        .build(*engine);
        
    bloomUpRenderTarget = filament::RenderTarget::Builder()
        .texture(filament::RenderTarget::AttachmentPoint::COLOR, bloomTexUp)
        .build(*engine);
        
    if (!gradedRenderTarget || !bloomDownRenderTarget || !bloomBlurRenderTarget || !bloomUpRenderTarget) {
        LOGE("Failed to create multi-pass render targets");
        return false;
    }
    
    // Set render targets on views
    viewGrading->setRenderTarget(gradedRenderTarget);
    viewDownsample->setRenderTarget(bloomDownRenderTarget);
    viewBlurDown->setRenderTarget(bloomBlurRenderTarget);
    viewBlurUp->setRenderTarget(bloomUpRenderTarget);
    
    // 3. Initialize all materials
    if (!initMaterials()) {
        LOGE("Failed to initialize Filament Materials");
        return false;
    }
    
    // 4. Initialize Geometry
    initGeometry();
    
    // Add entities to scenes
    sceneGrading->addEntity(quadGrading);
    sceneDownsample->addEntity(quadDownsample);
    sceneBlurDown->addEntity(quadBlurDown);
    sceneBlurUp->addEntity(quadBlurUp);
    scene->addEntity(quadComposite);
    
    // 5. Initialize 3D LUT Texture
    lutTexture = filament::Texture::Builder()
        .width(LUT_SIZE)
        .height(LUT_SIZE)
        .depth(LUT_SIZE)
        .levels(1)
        .sampler(filament::Texture::Sampler::SAMPLER_3D)
        .format(filament::Texture::InternalFormat::RGBA8)
        .build(*engine);
        
    if (!lutTexture) {
        LOGE("Failed to create 3D LUT Texture");
        return false;
    }
    
    // 6. Bind static parameters on materials
    filament::TextureSampler samplerLinear(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    
    materialInstanceDownsample->setParameter("u_Texture", gradedTexture, samplerLinear);
    
    float downW = std::max(1.0f, static_cast<float>(width / 4));
    float downH = std::max(1.0f, static_cast<float>(height / 4));
    materialInstanceBlurDown->setParameter("u_Texture", bloomTexDown, samplerLinear);
    materialInstanceBlurDown->setParameter("u_TexelSize", filament::math::float2(1.0f / downW, 1.0f / downH));
    
    float blurW = std::max(1.0f, static_cast<float>(width / 8));
    float blurH = std::max(1.0f, static_cast<float>(height / 8));
    materialInstanceBlurUp->setParameter("u_Texture", bloomTexBlur, samplerLinear);
    materialInstanceBlurUp->setParameter("u_TexelSize", filament::math::float2(1.0f / blurW, 1.0f / blurH));
    
    materialInstanceComposite->setParameter("u_Texture", gradedTexture, samplerLinear);
    materialInstanceComposite->setParameter("u_BloomTexture", bloomTexUp, samplerLinear);

    // Start background thread for LUT baking
    lutThreadRunning = true;
    lutThread = std::thread(&GrovkornetEngine::lutGenerationLoop, this);
    
    // Trigger initial LUT bake
    triggerLutUpdate(1.0f, 1.0f, 0.0f, 5000.0f, 0.0f);

    LOGI("Filament Engine initialized successfully.");
    return true;
}

GrovkornetEngine::~GrovkornetEngine() {
    LOGI("Destroying Filament Engine resources...");
    
    // Stop background LUT thread
    {
        std::unique_lock<std::mutex> lock(lutMutex);
        lutThreadRunning = false;
        lutCv.notify_all();
    }
    if (lutThread.joinable()) {
        lutThread.join();
    }
    
    if (engine) {
        // Destroy views
        if (viewGrading) engine->destroy(viewGrading);
        if (viewDownsample) engine->destroy(viewDownsample);
        if (viewBlurDown) engine->destroy(viewBlurDown);
        if (viewBlurUp) engine->destroy(viewBlurUp);
        
        // Destroy scenes
        if (sceneGrading) engine->destroy(sceneGrading);
        if (sceneDownsample) engine->destroy(sceneDownsample);
        if (sceneBlurDown) engine->destroy(sceneBlurDown);
        if (sceneBlurUp) engine->destroy(sceneBlurUp);
        
        // Destroy entities
        engine->destroy(quadGrading);
        engine->destroy(quadDownsample);
        engine->destroy(quadBlurDown);
        engine->destroy(quadBlurUp);
        engine->destroy(quadComposite);
        engine->destroy(quadEntity); // Legacy
        
        if (vertexBuffer) engine->destroy(vertexBuffer);
        if (indexBuffer) engine->destroy(indexBuffer);
        
        // Destroy material instances and materials
        if (materialInstance2D) engine->destroy(materialInstance2D);
        if (material2D) engine->destroy(material2D);
        
        if (materialInstanceExternal) engine->destroy(materialInstanceExternal);
        if (materialExternal) engine->destroy(materialExternal);
        
        if (materialInstanceDownsample) engine->destroy(materialInstanceDownsample);
        if (materialDownsample) engine->destroy(materialDownsample);
        
        if (materialInstanceBlurDown) engine->destroy(materialInstanceBlurDown);
        if (materialBlurDown) engine->destroy(materialBlurDown);
        
        if (materialInstanceBlurUp) engine->destroy(materialInstanceBlurUp);
        if (materialBlurUp) engine->destroy(materialBlurUp);
        
        if (materialInstanceComposite) engine->destroy(materialInstanceComposite);
        if (materialComposite) engine->destroy(materialComposite);
        
        // Destroy RenderTargets first
        if (gradedRenderTarget) engine->destroy(gradedRenderTarget);
        if (bloomDownRenderTarget) engine->destroy(bloomDownRenderTarget);
        if (bloomBlurRenderTarget) engine->destroy(bloomBlurRenderTarget);
        if (bloomUpRenderTarget) engine->destroy(bloomUpRenderTarget);
        
        // Destroy Textures
        if (inputTexture2D) engine->destroy(inputTexture2D);
        if (inputTextureExternal) engine->destroy(inputTextureExternal);
        if (lutTexture) engine->destroy(lutTexture);
        if (gradedTexture) engine->destroy(gradedTexture);
        if (bloomTexDown) engine->destroy(bloomTexDown);
        if (bloomTexBlur) engine->destroy(bloomTexBlur);
        if (bloomTexUp) engine->destroy(bloomTexUp);
        
        if (swapChain) engine->destroy(swapChain);
        engine->destroy(view);
        engine->destroy(scene);
        
        utils::Entity cameraEntity = camera->getEntity();
        engine->destroyCameraComponent(cameraEntity);
        utils::EntityManager::get().destroy(cameraEntity);
        
        engine->destroy(renderer);
        filament::Engine::destroy(&engine);
    }
    LOGI("Filament Engine resources destroyed.");
}

bool GrovkornetEngine::initMaterials() {
    filamat::MaterialBuilder::init();
    
    const char* shaderCode = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            
            vec4 color = texture(materialParams_u_Texture, uv);
            
            // Apply 3D LUT lookup
            // Formula to align sample coordinate to 3D texture texel centers
            vec3 lutCoord = color.rgb * (32.0 / 33.0) + (0.5 / 33.0);
            vec4 gradedColor = texture(materialParams_u_LutTexture, lutCoord);
            
            material.baseColor = vec4(gradedColor.rgb, color.a);
        }
    )SHADER";

    const char* shaderDownsample = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            vec4 color = texture(materialParams_u_Texture, uv);
            
            // Extract luminance
            float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
            
            // Highlight isolate threshold (cinematic smoothstep)
            float threshold = 0.65;
            float knee = 0.15;
            float weight = smoothstep(threshold - knee, threshold + knee, luma);
            
            material.baseColor = vec4(color.rgb * weight, color.a);
        }
    )SHADER";

    const char* shaderBlurDown = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            vec2 texelSize = materialParams.u_TexelSize;
            vec2 halfPixel = texelSize * 0.5;
            
            vec3 sum = texture(materialParams_u_Texture, uv).rgb * 4.0;
            sum += texture(materialParams_u_Texture, uv - halfPixel).rgb;
            sum += texture(materialParams_u_Texture, uv + halfPixel).rgb;
            sum += texture(materialParams_u_Texture, uv + vec2(-halfPixel.x, halfPixel.y)).rgb;
            sum += texture(materialParams_u_Texture, uv + vec2(halfPixel.x, -halfPixel.y)).rgb;
            
            material.baseColor = vec4(sum * 0.125, 1.0);
        }
    )SHADER";

    const char* shaderBlurUp = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            vec2 texelSize = materialParams.u_TexelSize;
            
            vec2 d1 = texelSize * 1.0;
            vec2 d2 = texelSize * 2.0;
            
            vec3 sum = vec3(0.0);
            sum += texture(materialParams_u_Texture, uv + vec2(-d1.x, -d1.y)).rgb * 2.0;
            sum += texture(materialParams_u_Texture, uv + vec2(d1.x, -d1.y)).rgb * 2.0;
            sum += texture(materialParams_u_Texture, uv + vec2(-d1.x, d1.y)).rgb * 2.0;
            sum += texture(materialParams_u_Texture, uv + vec2(d1.x, d1.y)).rgb * 2.0;
            
            sum += texture(materialParams_u_Texture, uv + vec2(0.0, -d2.y)).rgb;
            sum += texture(materialParams_u_Texture, uv + vec2(0.0, d2.y)).rgb;
            sum += texture(materialParams_u_Texture, uv + vec2(-d2.x, 0.0)).rgb;
            sum += texture(materialParams_u_Texture, uv + vec2(d2.x, 0.0)).rgb;
            
            material.baseColor = vec4(sum * 0.083333, 1.0);
        }
    )SHADER";

    const char* shaderComposite = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            vec4 baseColor = texture(materialParams_u_Texture, uv);
            vec3 bloomColor = texture(materialParams_u_BloomTexture, uv).rgb;
            
            // Soft additive blend in linear space
            float bloomIntensity = 0.35;
            vec3 finalColor = baseColor.rgb + bloomColor * bloomIntensity;
            
            material.baseColor = vec4(finalColor, baseColor.a);
        }
    )SHADER";

    // --- Compile 2D Material ---
    filamat::MaterialBuilder builder2D;
    builder2D.name("FilmShader2D")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderCode)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_LutTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_3D)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package package2D = builder2D.build(engine->getJobSystem());
    if (!package2D.isValid()) {
        LOGE("2D Material compilation failed.");
        return false;
    }
    
    material2D = filament::Material::Builder()
        .package(package2D.getData(), package2D.getSize())
        .build(*engine);
        
    if (!material2D) return false;
    materialInstance2D = material2D->createInstance();

    // --- Compile External (OES/HardwareBuffer) Material ---
    filamat::MaterialBuilder builderExternal;
    builderExternal.name("FilmShaderExternal")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderCode)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_EXTERNAL)
           .parameter("u_LutTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_3D)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageExternal = builderExternal.build(engine->getJobSystem());
    if (!packageExternal.isValid()) {
        LOGE("External Material compilation failed.");
        return false;
    }
    
    materialExternal = filament::Material::Builder()
        .package(packageExternal.getData(), packageExternal.getSize())
        .build(*engine);
        
    if (!materialExternal) return false;
    materialInstanceExternal = materialExternal->createInstance();

    // --- Compile Downsample Material ---
    filamat::MaterialBuilder builderDownsample;
    builderDownsample.name("DownsampleShader")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderDownsample)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageDownsample = builderDownsample.build(engine->getJobSystem());
    if (!packageDownsample.isValid()) {
        LOGE("Downsample Material compilation failed.");
        return false;
    }
    materialDownsample = filament::Material::Builder()
        .package(packageDownsample.getData(), packageDownsample.getSize())
        .build(*engine);
    if (!materialDownsample) return false;
    materialInstanceDownsample = materialDownsample->createInstance();

    // --- Compile Blur Down Material ---
    filamat::MaterialBuilder builderBlurDown;
    builderBlurDown.name("BlurDownShader")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderBlurDown)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_TexelSize", filamat::MaterialBuilder::UniformType::FLOAT2)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageBlurDown = builderBlurDown.build(engine->getJobSystem());
    if (!packageBlurDown.isValid()) {
        LOGE("Blur Down Material compilation failed.");
        return false;
    }
    materialBlurDown = filament::Material::Builder()
        .package(packageBlurDown.getData(), packageBlurDown.getSize())
        .build(*engine);
    if (!materialBlurDown) return false;
    materialInstanceBlurDown = materialBlurDown->createInstance();

    // --- Compile Blur Up Material ---
    filamat::MaterialBuilder builderBlurUp;
    builderBlurUp.name("BlurUpShader")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderBlurUp)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_TexelSize", filamat::MaterialBuilder::UniformType::FLOAT2)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageBlurUp = builderBlurUp.build(engine->getJobSystem());
    if (!packageBlurUp.isValid()) {
        LOGE("Blur Up Material compilation failed.");
        return false;
    }
    materialBlurUp = filament::Material::Builder()
        .package(packageBlurUp.getData(), packageBlurUp.getSize())
        .build(*engine);
    if (!materialBlurUp) return false;
    materialInstanceBlurUp = materialBlurUp->createInstance();

    // --- Compile Composite Material ---
    filamat::MaterialBuilder builderComposite;
    builderComposite.name("CompositeShader")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderComposite)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_BloomTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageComposite = builderComposite.build(engine->getJobSystem());
    if (!packageComposite.isValid()) {
        LOGE("Composite Material compilation failed.");
        return false;
    }
    materialComposite = filament::Material::Builder()
        .package(packageComposite.getData(), packageComposite.getSize())
        .build(*engine);
    if (!materialComposite) return false;
    materialInstanceComposite = materialComposite->createInstance();

    return true;
}

void GrovkornetEngine::initGeometry() {
    struct Vertex {
        float position[2];
        float uv[2];
    };
    
    static const Vertex vertices[4] = {
        {{ -1.0f, -1.0f }, { 0.0f, 0.0f }},
        {{  1.0f, -1.0f }, { 1.0f, 0.0f }},
        {{ -1.0f,  1.0f }, { 0.0f, 1.0f }},
        {{  1.0f,  1.0f }, { 1.0f, 1.0f }}
    };
    
    static const uint16_t indices[6] = {
        0, 1, 2,
        2, 1, 3
    };
    
    vertexBuffer = filament::VertexBuffer::Builder()
        .vertexCount(4)
        .bufferCount(1)
        .attribute(filament::VertexAttribute::POSITION, 0, filament::VertexBuffer::AttributeType::FLOAT2, offsetof(Vertex, position), sizeof(Vertex))
        .attribute(filament::VertexAttribute::UV0, 0, filament::VertexBuffer::AttributeType::FLOAT2, offsetof(Vertex, uv), sizeof(Vertex))
        .build(*engine);
        
    vertexBuffer->setBufferAt(*engine, 0, filament::VertexBuffer::BufferDescriptor(vertices, sizeof(vertices)));
    
    indexBuffer = filament::IndexBuffer::Builder()
        .indexCount(6)
        .bufferType(filament::IndexBuffer::IndexType::USHORT)
        .build(*engine);
        
    indexBuffer->setBuffer(*engine, filament::IndexBuffer::BufferDescriptor(indices, sizeof(indices)));
    
    quadEntity = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstance2D)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadEntity);

    quadGrading = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstance2D)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadGrading);
        
    quadDownsample = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstanceDownsample)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadDownsample);
        
    quadBlurDown = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstanceBlurDown)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadBlurDown);
        
    quadBlurUp = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstanceBlurUp)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadBlurUp);
        
    quadComposite = utils::EntityManager::get().create();
    filament::RenderableManager::Builder(1)
        .boundingBox({{ 0, 0, 0 }, { 1, 1, 1 }})
        .material(0, materialInstanceComposite)
        .geometry(0, filament::RenderableManager::PrimitiveType::TRIANGLES, vertexBuffer, indexBuffer, 0, 6)
        .culling(false)
        .build(*engine, quadComposite);
}

void GrovkornetEngine::lutGenerationLoop() {
    std::vector<uint8_t> tempBuffer(LUT_SIZE * LUT_SIZE * LUT_SIZE * 4);
    
    while (true) {
        float saturation = 1.0f;
        float contrast = 1.0f;
        float ev = 0.0f;
        float whiteBalance = 5000.0f;
        float tint = 0.0f;
        
        {
            std::unique_lock<std::mutex> lock(lutMutex);
            lutCv.wait(lock, [this]() { return !lutThreadRunning || lutParametersDirty; });
            
            if (!lutThreadRunning) {
                break;
            }
            
            saturation = currentSaturation;
            contrast = currentContrast;
            ev = currentEv;
            whiteBalance = currentWhiteBalance;
            tint = currentTint;
            
            lutParametersDirty = false;
        }
        
        // Compute LUT on CPU
        int index = 0;
        for (int b = 0; b < LUT_SIZE; ++b) {
            float b_val = (float)b / (LUT_SIZE - 1);
            for (int g = 0; g < LUT_SIZE; ++g) {
                float g_val = (float)g / (LUT_SIZE - 1);
                for (int r = 0; r < LUT_SIZE; ++r) {
                    float r_val = (float)r / (LUT_SIZE - 1);
                    
                    // 1. Saturation
                    float luminance = r_val * 0.2126f + g_val * 0.7152f + b_val * 0.0722f;
                    float out_r = luminance + (r_val - luminance) * saturation;
                    float out_g = luminance + (g_val - luminance) * saturation;
                    float out_b = luminance + (b_val - luminance) * saturation;
                    
                    // 2. Contrast
                    out_r = ((out_r - 0.5f) * std::max(contrast, 0.0f)) + 0.5f;
                    out_g = ((out_g - 0.5f) * std::max(contrast, 0.0f)) + 0.5f;
                    out_b = ((out_b - 0.5f) * std::max(contrast, 0.0f)) + 0.5f;
                    
                    // 3. EV Exposure
                    float evMultiplier = std::pow(2.0f, ev);
                    out_r *= evMultiplier;
                    out_g *= evMultiplier;
                    out_b *= evMultiplier;
                    
                    // 4. White Balance & Tint
                    float temp = whiteBalance / 5000.0f;
                    float tintOffset = tint / 100.0f;
                    float wb_r = temp * (1.0f + tintOffset * 0.2f);
                    float wb_g = 1.0f - tintOffset * 0.2f;
                    float wb_b = (1.0f / temp) * (1.0f + tintOffset * 0.2f);
                    
                    out_r *= wb_r;
                    out_g *= wb_g;
                    out_b *= wb_b;
                    
                    // Clip to [0, 1]
                    out_r = std::max(0.0f, std::min(1.0f, out_r));
                    out_g = std::max(0.0f, std::min(1.0f, out_g));
                    out_b = std::max(0.0f, std::min(1.0f, out_b));
                    
                    tempBuffer[index++] = static_cast<uint8_t>(out_r * 255.0f + 0.5f);
                    tempBuffer[index++] = static_cast<uint8_t>(out_g * 255.0f + 0.5f);
                    tempBuffer[index++] = static_cast<uint8_t>(out_b * 255.0f + 0.5f);
                    tempBuffer[index++] = 255; // Alpha channel
                }
            }
        }
        
        {
            std::unique_lock<std::mutex> lock(lutMutex);
            lutBuffer = tempBuffer;
            lutDataReady = true;
            lutCv.notify_all(); // Wake up any waiting render thread
        }
    }
}

void GrovkornetEngine::triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint) {
    std::unique_lock<std::mutex> lock(lutMutex);
    
    // Check if parameters actually changed
    if (saturation == currentSaturation && contrast == currentContrast &&
        ev == currentEv && whiteBalance == currentWhiteBalance && tint == currentTint) {
        return;
    }
    
    currentSaturation = saturation;
    currentContrast = contrast;
    currentEv = ev;
    currentWhiteBalance = whiteBalance;
    currentTint = tint;
    
    lutParametersDirty = true;
    lutCv.notify_one();
}

void GrovkornetEngine::applyLutTextureUpdate() {
    std::vector<uint8_t> localLut;
    bool updateNeeded = false;
    
    {
        std::unique_lock<std::mutex> lock(lutMutex);
        // Wait if parameters are dirty OR if we haven't successfully baked the first LUT yet
        if (lutParametersDirty || (activeSaturation < 0 && !lutDataReady)) {
            lutCv.wait(lock, [this]() { return !lutParametersDirty && lutDataReady; });
        }
        
        if (lutDataReady) {
            localLut = lutBuffer;
            lutDataReady = false;
            updateNeeded = true;
            
            // Update active parameters cache
            activeSaturation = currentSaturation;
            activeContrast = currentContrast;
            activeEv = currentEv;
            activeWhiteBalance = currentWhiteBalance;
            activeTint = currentTint;
        }
    }
    
    if (updateNeeded) {
        // Allocate buffer on heap to survive asynchronous upload
        auto* bufferCopy = new std::vector<uint8_t>(std::move(localLut));
        // Upload the new LUT to the 3D texture with explicit dimensions (width, height, depth)
        lutTexture->setImage(*engine, 0, 0, 0, 0, LUT_SIZE, LUT_SIZE, LUT_SIZE, filament::Texture::PixelBufferDescriptor(
            bufferCopy->data(),
            bufferCopy->size(),
            filament::backend::PixelDataFormat::RGBA,
            filament::backend::PixelDataType::UBYTE,
            [](void* buffer, size_t size, void* user) {
                delete static_cast<std::vector<uint8_t>*>(user);
            },
            bufferCopy
        ));
    }
}

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    LOGI("Grovkornet Engine JNI Library Loaded Successfully");
    return JNI_VERSION_1_6;
}

JNIEXPORT jlong JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativePrepare(
        JNIEnv* env, jobject thiz, jint width, jint height) {
    GrovkornetEngine* engine = new GrovkornetEngine(width, height);
    if (!engine->init()) {
        delete engine;
        return 0;
    }
    return reinterpret_cast<jlong>(engine);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessBitmap(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject bitmap_in, jobject bitmap_out,
        jfloat saturation, jfloat contrast, jfloat ev, jfloat white_balance, jfloat tint) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeProcessBitmap");
        return;
    }

    // 1. Lock bitmap pixels
    AndroidBitmapInfo infoIn;
    void* pixelsIn = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap_in, &infoIn) < 0 || AndroidBitmap_lockPixels(env, bitmap_in, &pixelsIn) < 0) {
        LOGE("Failed to lock input bitmap pixels");
        return;
    }
    
    AndroidBitmapInfo infoOut;
    void* pixelsOut = nullptr;
    if (AndroidBitmap_getInfo(env, bitmap_out, &infoOut) < 0 || AndroidBitmap_lockPixels(env, bitmap_out, &pixelsOut) < 0) {
        LOGE("Failed to lock output bitmap pixels");
        AndroidBitmap_unlockPixels(env, bitmap_in);
        return;
    }

    // 2. Setup or update input texture
    if (!enginePtr->inputTexture2D) {
        enginePtr->inputTexture2D = filament::Texture::Builder()
            .width(enginePtr->width)
            .height(enginePtr->height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_2D)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*(enginePtr->engine));
    }

    // Upload input pixels to texture
    enginePtr->inputTexture2D->setImage(*(enginePtr->engine), 0, filament::Texture::PixelBufferDescriptor(
        pixelsIn, 
        enginePtr->width * enginePtr->height * 4, 
        filament::backend::PixelDataFormat::RGBA, 
        filament::backend::PixelDataType::UBYTE
    ));

    // 3. Update geometry to use the 2D material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->materialInstance2D);
    }

    // 4. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();

    // Set material parameters
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    enginePtr->materialInstance2D->setParameter("u_Texture", enginePtr->inputTexture2D, sampler2d);
    
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    enginePtr->materialInstance2D->setParameter("u_LutTexture", enginePtr->lutTexture, sampler3d);

    // 5. Render and readback inside frame boundary
    if (enginePtr->renderer->beginFrame(enginePtr->swapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        enginePtr->renderer->render(enginePtr->viewDownsample);
        enginePtr->renderer->render(enginePtr->viewBlurDown);
        enginePtr->renderer->render(enginePtr->viewBlurUp);
        enginePtr->renderer->render(enginePtr->view);
        
        // 6. Read back pixels to output bitmap (must be before endFrame for SwapChain)
        filament::backend::PixelBufferDescriptor desc(
            pixelsOut, 
            enginePtr->width * enginePtr->height * 4, 
            filament::backend::PixelDataFormat::RGBA, 
            filament::backend::PixelDataType::UBYTE
        );
        enginePtr->renderer->readPixels(0, 0, enginePtr->width, enginePtr->height, std::move(desc));
        
        enginePtr->renderer->endFrame();
    }
    
    // Flush commands and wait for GPU completion (includes rendering and readback)
    enginePtr->engine->flushAndWait();

    // 7. Unlock bitmap pixels
    AndroidBitmap_unlockPixels(env, bitmap_in);
    AndroidBitmap_unlockPixels(env, bitmap_out);
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeProcessHardwareBuffer(
        JNIEnv* env, jobject thiz, jlong engine_ptr, jobject hardware_buffer_obj,
        jfloat saturation, jfloat contrast, jfloat ev, jfloat white_balance, jfloat tint) {
    
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (!enginePtr) {
        LOGE("Invalid native engine pointer in nativeProcessHardwareBuffer");
        return;
    }

    // 1. Get AHardwareBuffer from the Kotlin/Java HardwareBuffer object
    AHardwareBuffer* hardwareBuffer = AHardwareBuffer_fromHardwareBuffer(env, hardware_buffer_obj);
    if (!hardwareBuffer) {
        LOGE("Failed to get AHardwareBuffer from Java HardwareBuffer");
        return;
    }

    AHardwareBuffer_Desc desc;
    AHardwareBuffer_describe(hardwareBuffer, &desc);

    // 2. Setup or update external input texture
    if (!enginePtr->inputTextureExternal) {
        enginePtr->inputTextureExternal = filament::Texture::Builder()
            .width(desc.width)
            .height(desc.height)
            .levels(1)
            .sampler(filament::Texture::Sampler::SAMPLER_EXTERNAL)
            .format(filament::Texture::InternalFormat::RGBA8)
            .build(*(enginePtr->engine));
    }

    // Map the hardware buffer to our external texture
    enginePtr->inputTextureExternal->setExternalImage(*(enginePtr->engine), hardwareBuffer);

    // 3. Update geometry to use the External material
    auto& rcm = enginePtr->engine->getRenderableManager();
    auto instance = rcm.getInstance(enginePtr->quadGrading);
    if (instance) {
        rcm.setMaterialInstanceAt(instance, 0, enginePtr->materialInstanceExternal);
    }

    // 4. Trigger LUT calculation on CPU and apply it to GPU texture
    enginePtr->triggerLutUpdate(saturation, contrast, ev, white_balance, tint);
    enginePtr->applyLutTextureUpdate();

    // Set material parameters
    filament::TextureSampler sampler2d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR);
    enginePtr->materialInstanceExternal->setParameter("u_Texture", enginePtr->inputTextureExternal, sampler2d);
    
    filament::TextureSampler sampler3d(filament::TextureSampler::MinFilter::LINEAR, filament::TextureSampler::MagFilter::LINEAR, filament::TextureSampler::WrapMode::CLAMP_TO_EDGE);
    enginePtr->materialInstanceExternal->setParameter("u_LutTexture", enginePtr->lutTexture, sampler3d);

    // 5. Render
    if (enginePtr->renderer->beginFrame(enginePtr->swapChain)) {
        enginePtr->renderer->render(enginePtr->viewGrading);
        enginePtr->renderer->render(enginePtr->viewDownsample);
        enginePtr->renderer->render(enginePtr->viewBlurDown);
        enginePtr->renderer->render(enginePtr->viewBlurUp);
        enginePtr->renderer->render(enginePtr->view);
        enginePtr->renderer->endFrame();
    }
    
    // Flush commands and wait for GPU completion
    enginePtr->engine->flushAndWait();
}

JNIEXPORT void JNICALL
Java_com_grovkornet_nativefilmcamera_rendering_OffscreenFilmProcessor_nativeRelease(
        JNIEnv* env, jobject thiz, jlong engine_ptr) {
    GrovkornetEngine* enginePtr = reinterpret_cast<GrovkornetEngine*>(engine_ptr);
    if (enginePtr) {
        delete enginePtr;
    }
}

}
