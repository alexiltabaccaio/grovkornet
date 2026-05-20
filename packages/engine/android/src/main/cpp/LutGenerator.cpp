#include "LutGenerator.h"
#include <cmath>
#include <algorithm>

LutGenerator::LutGenerator() {
    lutBuffer.resize(LUT_SIZE * LUT_SIZE * LUT_SIZE * 4, 0);
    lutParametersDirty = true;
}

LutGenerator::~LutGenerator() {
    stop();
}

void LutGenerator::start() {
    std::unique_lock<std::mutex> lock(lutMutex);
    if (!lutThreadRunning) {
        lutThreadRunning = true;
        lutParametersDirty = true;
        lutThread = std::thread(&LutGenerator::lutGenerationLoop, this);
    }
}

void LutGenerator::stop() {
    {
        std::unique_lock<std::mutex> lock(lutMutex);
        if (!lutThreadRunning) return;
        lutThreadRunning = false;
        lutCv.notify_all();
    }
    if (lutThread.joinable()) {
        lutThread.join();
    }
}

void LutGenerator::triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint) {
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

void LutGenerator::applyLutTextureUpdate(filament::Engine& engine, filament::Texture* lutTexture) {
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
    
    if (updateNeeded && lutTexture) {
        // Allocate buffer on heap to survive asynchronous upload
        auto* bufferCopy = new std::vector<uint8_t>(std::move(localLut));
        // Upload the new LUT to the 3D texture with explicit dimensions (width, height, depth)
        lutTexture->setImage(engine, 0, 0, 0, 0, LUT_SIZE, LUT_SIZE, LUT_SIZE, filament::Texture::PixelBufferDescriptor(
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

void LutGenerator::lutGenerationLoop() {
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
