#include "ShaderManager.h"
#include <android/log.h>
#include <filamat/MaterialBuilder.h>

#define LOG_TAG "ShaderManager"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

ShaderManager::ShaderManager() {}

ShaderManager::~ShaderManager() {}

static bool isFilamatInitialized = false;

bool ShaderManager::init(filament::Engine& engine) {
    if (!isFilamatInitialized) {
        filamat::MaterialBuilder::init();
        isFilamatInitialized = true;
    }
    
    const char* shaderCode2D = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            
            vec4 color = texture(materialParams_u_Texture, uv);
            
            // Apply 3D LUT lookup
            vec3 lutCoord = color.rgb * (32.0 / 33.0) + (0.5 / 33.0);
            vec4 gradedColor = texture(materialParams_u_LutTexture, lutCoord);
            
            material.baseColor = vec4(gradedColor.rgb, color.a);
        }
    )SHADER";

    const char* shaderCodeExternal = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = (materialParams.u_UvMatrix * vec4(getUV0(), 0.0, 1.0)).xy;
            
            vec4 color = texture(materialParams_u_Texture, uv);
            
            // Apply 3D LUT lookup
            vec3 lutCoord = color.rgb * (32.0 / 33.0) + (0.5 / 33.0);
            vec4 gradedColor = texture(materialParams_u_LutTexture, lutCoord);
            
            material.baseColor = vec4(gradedColor.rgb, color.a);
        }
    )SHADER";

    const char* shaderDownsample = R"SHADER(
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0() * materialParams.u_DrsScale;
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
            vec2 uv = getUV0() * materialParams.u_DrsScale;
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
            vec2 uv = getUV0() * materialParams.u_DrsScale;
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
        highp float rand(highp vec2 co) {
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }
        void material(inout MaterialInputs material) {
            prepareMaterial(material);
            vec2 uv = getUV0();
            vec2 baseUv = uv * materialParams.u_DrsScale;
            vec2 compositeUv = baseUv;
            vec4 baseColor;
            
            vec2 rUv = compositeUv;
            vec2 gUv = compositeUv;
            vec2 bUv = compositeUv;

            if (materialParams.u_VhsIntensity > 0.0) {
                float jitter = sin(uv.y * 50.0 + materialParams.u_Time * 10.0) * 0.002 * materialParams.u_VhsIntensity;
                compositeUv.x += jitter;
                
                float shift = 0.005 * materialParams.u_VhsIntensity;
                rUv = vec2(compositeUv.x - shift, compositeUv.y);
                gUv = compositeUv;
                bUv = vec2(compositeUv.x + shift, compositeUv.y);
            }

            if (materialParams.u_ChromaticAberration > 0.0) {
                float caIntensity = materialParams.u_ChromaticAberration * 0.02;
                vec2 caShift = vec2(0.0);
                if (materialParams.u_AberrationDirection < 0.5) {
                    caShift = vec2(0.0, caIntensity);
                } else if (materialParams.u_AberrationDirection < 1.5) {
                    caShift = vec2(caIntensity, 0.0);
                } else {
                    vec2 dir = normalize(uv - 0.5);
                    float dist = length(uv - 0.5);
                    caShift = dir * dist * caIntensity;
                }
                rUv -= caShift;
                bUv += caShift;
            }

            vec4 colR = texture(materialParams_u_Texture, rUv);
            vec4 colG = texture(materialParams_u_Texture, gUv);
            vec4 colB = texture(materialParams_u_Texture, bUv);
            baseColor = vec4(colR.r, colG.g, colB.b, colG.a);

            if (materialParams.u_Sharpening > 0.0) {
                vec2 texel = materialParams.u_TexelSize;
                vec3 colN = texture(materialParams_u_Texture, compositeUv + vec2(0.0, texel.y)).rgb;
                vec3 colS = texture(materialParams_u_Texture, compositeUv - vec2(0.0, texel.y)).rgb;
                vec3 colE = texture(materialParams_u_Texture, compositeUv + vec2(texel.x, 0.0)).rgb;
                vec3 colW = texture(materialParams_u_Texture, compositeUv - vec2(texel.x, 0.0)).rgb;
                
                vec3 laplacian = 4.0 * baseColor.rgb - (colN + colS + colE + colW);
                baseColor.rgb += laplacian * materialParams.u_Sharpening * 10.0;
            }

            if (materialParams.u_VhsIntensity > 0.0) {
                // Scanlines
                float scanline = sin(uv.y * 800.0) * 0.04 * materialParams.u_VhsIntensity;
                baseColor.rgb -= vec3(scanline);
            }
            
            // Fix for inverted bloom reflection: flip the V coordinate within the valid DRS range
            vec2 flippedBloomUv = vec2(compositeUv.x, materialParams.u_DrsScale - compositeUv.y);
            vec3 bloomColor = texture(materialParams_u_BloomTexture, flippedBloomUv).rgb;
            
            // Soft additive blend in linear space
            vec3 finalColor = baseColor.rgb + bloomColor * materialParams.u_BloomIntensity;
            
            // Vignette
            if (materialParams.u_VignetteIntensity > 0.0) {
                vec2 d = abs(uv - 0.5) * materialParams.u_VignetteIntensity;
                float vignette = 1.0 - dot(d, d);
                finalColor *= clamp(vignette, 0.0, 1.0);
            }
            
            // Grain (procedural)
            if (materialParams.u_GrainIntensity > 0.0) {
                highp float size = materialParams.u_GrainSize;
                highp vec2 grainUv = floor(uv * (1080.0 / clamp(size, 0.1, 10.0))) * clamp(size, 0.1, 10.0) / 1080.0;
                
                highp float noiseR = fract(rand(grainUv) + materialParams.u_Time * 0.13);
                highp float noiseG = fract(rand(grainUv + vec2(17.0, 31.0)) + materialParams.u_Time * 0.21);
                highp float noiseB = fract(rand(grainUv + vec2(43.0, 71.0)) + materialParams.u_Time * 0.37);
                
                highp vec3 noise = vec3(noiseR, noiseG, noiseB);
                highp float monoNoise = (noise.r + noise.g + noise.b) / 3.0;
                highp vec3 finalNoise = mix(vec3(monoNoise), noise, materialParams.u_GrainChroma) - 0.5;
                
                finalColor += finalNoise * materialParams.u_GrainIntensity;
            }
            
            // Overlay Texture (Dust & Scratch)
            if (materialParams.u_OverlayEnabled > 0.0) {
                vec4 overlay = texture(materialParams_u_OverlayTexture, uv);
                finalColor = mix(finalColor, overlay.rgb, overlay.a);
            }
            
            material.baseColor = vec4(finalColor, baseColor.a);
        }
    )SHADER";

    // --- Compile 2D Material ---
    filamat::MaterialBuilder builder2D;
    builder2D.name("FilmShader2D")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderCode2D)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_LutTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_3D)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package package2D = builder2D.build(engine.getJobSystem());
    if (!package2D.isValid()) {
        LOGE("2D Material compilation failed.");
        return false;
    }
    
    material2D = filament::Material::Builder()
        .package(package2D.getData(), package2D.getSize())
        .build(engine);
        
    if (!material2D) return false;
    materialInstance2D = material2D->createInstance();

    // --- Compile External (OES/HardwareBuffer) Material ---
    filamat::MaterialBuilder builderExternal;
    builderExternal.name("FilmShaderExternal")
           .shading(filamat::MaterialBuilder::Shading::UNLIT)
           .targetApi(filamat::MaterialBuilder::TargetApi::ALL)
           .platform(filamat::MaterialBuilder::Platform::MOBILE)
           .material(shaderCodeExternal)
           .parameter("u_Texture", filamat::MaterialBuilder::SamplerType::SAMPLER_EXTERNAL)
           .parameter("u_LutTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_3D)
           .parameter("u_UvMatrix", filamat::MaterialBuilder::UniformType::MAT4)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageExternal = builderExternal.build(engine.getJobSystem());
    if (!packageExternal.isValid()) {
        LOGE("External Material compilation failed.");
        return false;
    }
    
    materialExternal = filament::Material::Builder()
        .package(packageExternal.getData(), packageExternal.getSize())
        .build(engine);
        
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
           .parameter("u_DrsScale", filamat::MaterialBuilder::UniformType::FLOAT)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageDownsample = builderDownsample.build(engine.getJobSystem());
    if (!packageDownsample.isValid()) {
        LOGE("Downsample Material compilation failed.");
        return false;
    }
    materialDownsample = filament::Material::Builder()
        .package(packageDownsample.getData(), packageDownsample.getSize())
        .build(engine);
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
           .parameter("u_DrsScale", filamat::MaterialBuilder::UniformType::FLOAT)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageBlurDown = builderBlurDown.build(engine.getJobSystem());
    if (!packageBlurDown.isValid()) {
        LOGE("Blur Down Material compilation failed.");
        return false;
    }
    materialBlurDown = filament::Material::Builder()
        .package(packageBlurDown.getData(), packageBlurDown.getSize())
        .build(engine);
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
           .parameter("u_DrsScale", filamat::MaterialBuilder::UniformType::FLOAT)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageBlurUp = builderBlurUp.build(engine.getJobSystem());
    if (!packageBlurUp.isValid()) {
        LOGE("Blur Up Material compilation failed.");
        return false;
    }
    materialBlurUp = filament::Material::Builder()
        .package(packageBlurUp.getData(), packageBlurUp.getSize())
        .build(engine);
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
           .parameter("u_GrainIntensity", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_GrainChroma", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_GrainSize", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_VignetteIntensity", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_VhsIntensity", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_Time", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_BloomIntensity", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_ChromaticAberration", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_AberrationDirection", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_OverlayTexture", filamat::MaterialBuilder::SamplerType::SAMPLER_2D)
           .parameter("u_OverlayEnabled", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_DrsScale", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_Sharpening", filamat::MaterialBuilder::UniformType::FLOAT)
           .parameter("u_TexelSize", filamat::MaterialBuilder::UniformType::FLOAT2)
           .require(filament::VertexAttribute::UV0);
           
    filamat::Package packageComposite = builderComposite.build(engine.getJobSystem());
    if (!packageComposite.isValid()) {
        LOGE("Composite Material compilation failed.");
        return false;
    }
    materialComposite = filament::Material::Builder()
        .package(packageComposite.getData(), packageComposite.getSize())
        .build(engine);
    if (!materialComposite) return false;
    materialInstanceComposite = materialComposite->createInstance();

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
