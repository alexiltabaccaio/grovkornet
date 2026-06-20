#pragma once

#include <memory>
#include <atomic>
#include <string>
#include "core/RenderParams.h"

struct RenderState {
    RenderParams renderParams;

    // Hardware parameters
    float ev = 0.0f;
    int targetFps = 60;
    int aspectRatio = 1;
    int noiseReduction = 1;
    bool isoAuto = true;
    bool shutterSpeedAuto = true;
    bool temperatureAuto = true;
    bool autoFocus = false;
    int iso = 400;
    long long exposureTime = 1000000000LL / 60;
    float focusDistance = 0.0f;
    bool torchEnabled = false;
    int torchStrength = 1;
    std::string cameraId = "";
    int resolutionSetting = 2;
    int previewQuality = 1;
    bool force60fpsCrop = true;
    bool secureViewEnabled = false;
    bool isSelfieCamera = false;
    float zoom = 1.0f;

    // Viewport parameters
    float viewportWidth = 1080.0f;
    float viewportHeight = 1920.0f;
    float targetResolution = 1080.0f;
    bool invertYShift = false;
};

class CameraStateManager {
private:
    std::shared_ptr<RenderState> m_activeState;

    CameraStateManager();

public:
    static CameraStateManager& getInstance() {
        static CameraStateManager instance;
        return instance;
    }

    CameraStateManager(const CameraStateManager&) = delete;
    CameraStateManager& operator=(const CameraStateManager&) = delete;

    std::shared_ptr<RenderState> getActiveState() const {
        return std::atomic_load(&m_activeState);
    }

    void updateState(const RenderState& newState) {
        std::atomic_store(&m_activeState, std::make_shared<RenderState>(newState));
    }

    // Lock-free atomic update of fields
    template<typename Func>
    void updateStateField(Func&& func) {
        auto current = std::atomic_load(&m_activeState);
        while (true) {
            auto updated = std::make_shared<RenderState>(*current);
            func(*updated);
            clampState(*updated);
            if (std::atomic_compare_exchange_weak(&m_activeState, &current, updated)) {
                break;
            }
        }
    }

    // Clamps the state variables to their limits
    void clampState(RenderState& state) const;
};
