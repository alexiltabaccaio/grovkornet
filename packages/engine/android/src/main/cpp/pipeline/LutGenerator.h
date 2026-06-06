#pragma once
#include <filament/Engine.h>
#include <filament/Texture.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <vector>
#include "../core/HardwareConfig.h"

class LutGenerator {
public:
    static constexpr int LUT_SIZE = HardwareConfig::LUT_SIZE;

    LutGenerator();
    ~LutGenerator();

    void start();
    void stop();

    void triggerLutUpdate(float saturation, float contrast, float ev, float whiteBalance, float tint,
                          float satRed, float satOrange, float satYellow, float satGreen,
                          float satCyan, float satBlue, float satPurple, float satMagenta,
                          float boundMagentaRed, float boundRedOrange, float boundOrangeYellow, float boundYellowGreen,
                          float boundGreenCyan, float boundCyanBlue, float boundBluePurple, float boundPurpleMagenta,
                          float blackLevel, float highlights, float pivot,
                          float contrastAuto, float blackLevelAuto, float highlightsAuto, float pivotAuto,
                          float hue,
                          float hueRed, float hueOrange, float hueYellow, float hueGreen,
                          float hueCyan, float hueBlue, float huePurple, float hueMagenta);
    void applyLutTextureUpdate(filament::Engine& engine, filament::Texture* lutTexture);
    void waitForLut();

    // Active cache getters (for keeping track of parameters currently bound on GPU)
    float getActiveSaturation() const { return activeSaturation; }
    bool isFirstLutBaked() const { return activeSaturation >= 0.0f; }

private:
    void lutGenerationLoop();

    std::thread lutThread;
    std::mutex lutMutex;
    std::condition_variable lutCv;
    bool lutThreadRunning = false;
    bool lutParametersDirty = false;
    bool lutDataReady = false;
    bool isComputingLut = false;

    // Sliders
    float currentSaturation = 1.0f;
    float currentContrast = 1.0f;
    float currentEv = 0.0f;
    float currentWhiteBalance = 5000.0f;
    float currentTint = 0.0f;
    float currentSatRed = 50.0f;
    float currentSatOrange = 50.0f;
    float currentSatYellow = 50.0f;
    float currentSatGreen = 50.0f;
    float currentSatCyan = 50.0f;
    float currentSatBlue = 50.0f;
    float currentSatPurple = 50.0f;
    float currentSatMagenta = 50.0f;
    float currentBoundMagentaRed = 350.0f;
    float currentBoundRedOrange = 45.0f;
    float currentBoundOrangeYellow = 80.0f;
    float currentBoundYellowGreen = 125.0f;
    float currentBoundGreenCyan = 170.0f;
    float currentBoundCyanBlue = 230.0f;
    float currentBoundBluePurple = 280.0f;
    float currentBoundPurpleMagenta = 315.0f;
    float currentBlackLevel = 0.0f;
    float currentHighlights = 1.0f;
    float currentPivot = 0.5f;
    float currentContrastAuto = 1.0f;
    float currentBlackLevelAuto = 1.0f;
    float currentHighlightsAuto = 1.0f;
    float currentPivotAuto = 1.0f;
    float currentHue = 0.0f;
    float currentHueRed = 0.0f;
    float currentHueOrange = 0.0f;
    float currentHueYellow = 0.0f;
    float currentHueGreen = 0.0f;
    float currentHueCyan = 0.0f;
    float currentHueBlue = 0.0f;
    float currentHuePurple = 0.0f;
    float currentHueMagenta = 0.0f;

    // Cache of active parameters mapped into GPU texture
    float activeSaturation = -1.0f;
    float activeContrast = -1.0f;
    float activeEv = -1.0f;
    float activeWhiteBalance = -1.0f;
    float activeTint = -1.0f;
    float activeSatRed = -1.0f;
    float activeSatOrange = -1.0f;
    float activeSatYellow = -1.0f;
    float activeSatGreen = -1.0f;
    float activeSatCyan = -1.0f;
    float activeSatBlue = -1.0f;
    float activeSatPurple = -1.0f;
    float activeSatMagenta = -1.0f;
    float activeBoundMagentaRed = -1.0f;
    float activeBoundRedOrange = -1.0f;
    float activeBoundOrangeYellow = -1.0f;
    float activeBoundYellowGreen = -1.0f;
    float activeBoundGreenCyan = -1.0f;
    float activeBoundCyanBlue = -1.0f;
    float activeBoundBluePurple = -1.0f;
    float activeBoundPurpleMagenta = -1.0f;
    float activeBlackLevel = -1.0f;
    float activeHighlights = -1.0f;
    float activePivot = -1.0f;
    float activeContrastAuto = -1.0f;
    float activeBlackLevelAuto = -1.0f;
    float activeHighlightsAuto = -1.0f;
    float activePivotAuto = -1.0f;
    float activeHue = -1.0f;
    float activeHueRed = -1.0f;
    float activeHueOrange = -1.0f;
    float activeHueYellow = -1.0f;
    float activeHueGreen = -1.0f;
    float activeHueCyan = -1.0f;
    float activeHueBlue = -1.0f;
    float activeHuePurple = -1.0f;
    float activeHueMagenta = -1.0f;

    std::vector<uint8_t> lutBuffer;
};
