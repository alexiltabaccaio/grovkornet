package com.margelo.nitro.com.grovkornet.nativefilmcamera

import com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView

class HybridNitroCameraConfiguration : HybridNitroCameraConfigurationSpec() {
    // @@GEN_OVERRIDES_START@@
    override var saturation: Double
        get() = NativeFilmCameraView.activeInstance?.config?.saturation?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                saturation = value.toFloat()
            }
        }

    override var contrast: Double
        get() = NativeFilmCameraView.activeInstance?.config?.contrast?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                contrast = value.toFloat()
            }
        }

    override var grainIntensity: Double
        get() = NativeFilmCameraView.activeInstance?.config?.grainIntensity?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainIntensity = value.toFloat()
            }
        }

    override var grainChroma: Double
        get() = NativeFilmCameraView.activeInstance?.config?.grainChroma?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainChroma = value.toFloat()
            }
        }

    override var grainSize: Double
        get() = NativeFilmCameraView.activeInstance?.config?.grainSize?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainSize = value.toFloat()
            }
        }

    override var grainSpeed: Double
        get() = NativeFilmCameraView.activeInstance?.config?.grainSpeed?.toDouble() ?: 20.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainSpeed = value.toFloat()
            }
        }

    override var vignetteIntensity: Double
        get() = NativeFilmCameraView.activeInstance?.config?.vignetteIntensity?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                vignetteIntensity = value.toFloat()
            }
        }

    override var chromaShift: Double
        get() = NativeFilmCameraView.activeInstance?.config?.chromaShift?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                chromaShift = value.toFloat()
            }
        }

    override var whiteBalance: Double
        get() = NativeFilmCameraView.activeInstance?.config?.whiteBalance?.toDouble() ?: 5000.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                whiteBalance = value.toFloat()
            }
        }

    override var tint: Double
        get() = NativeFilmCameraView.activeInstance?.config?.tint?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                tint = value.toFloat()
            }
        }

    override var bloomIntensity: Double
        get() = NativeFilmCameraView.activeInstance?.config?.bloomIntensity?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                bloomIntensity = value.toFloat()
            }
        }

    override var chromaticAberration: Double
        get() = NativeFilmCameraView.activeInstance?.config?.aberration?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                aberration = value.toFloat()
            }
        }

    override var chromaShiftDirection: Double
        get() = NativeFilmCameraView.activeInstance?.config?.chromaShiftDirection?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                chromaShiftDirection = value.toInt()
            }
        }

    override var sharpening: Double
        get() = NativeFilmCameraView.activeInstance?.config?.sharpening?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                sharpening = value.toFloat()
            }
        }

    override var satRed: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satRed?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satRed = value.toFloat()
            }
        }

    override var satOrange: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satOrange?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satOrange = value.toFloat()
            }
        }

    override var satYellow: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satYellow?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satYellow = value.toFloat()
            }
        }

    override var satGreen: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satGreen?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satGreen = value.toFloat()
            }
        }

    override var satCyan: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satCyan?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satCyan = value.toFloat()
            }
        }

    override var satBlue: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satBlue?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satBlue = value.toFloat()
            }
        }

    override var satPurple: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satPurple?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satPurple = value.toFloat()
            }
        }

    override var satMagenta: Double
        get() = NativeFilmCameraView.activeInstance?.config?.satMagenta?.toDouble() ?: 50.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                satMagenta = value.toFloat()
            }
        }

    override var aberrationInvert: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.aberrationInvert ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                aberrationInvert = value
            }
        }

    override var boundMagentaRed: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundMagentaRed?.toDouble() ?: 350.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundMagentaRed = value.toFloat()
            }
        }

    override var boundRedOrange: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundRedOrange?.toDouble() ?: 45.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundRedOrange = value.toFloat()
            }
        }

    override var boundOrangeYellow: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundOrangeYellow?.toDouble() ?: 80.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundOrangeYellow = value.toFloat()
            }
        }

    override var boundYellowGreen: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundYellowGreen?.toDouble() ?: 125.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundYellowGreen = value.toFloat()
            }
        }

    override var boundGreenCyan: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundGreenCyan?.toDouble() ?: 170.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundGreenCyan = value.toFloat()
            }
        }

    override var boundCyanBlue: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundCyanBlue?.toDouble() ?: 230.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundCyanBlue = value.toFloat()
            }
        }

    override var boundBluePurple: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundBluePurple?.toDouble() ?: 280.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundBluePurple = value.toFloat()
            }
        }

    override var boundPurpleMagenta: Double
        get() = NativeFilmCameraView.activeInstance?.config?.boundPurpleMagenta?.toDouble() ?: 315.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                boundPurpleMagenta = value.toFloat()
            }
        }

    override var grainRoughness: Double
        get() = NativeFilmCameraView.activeInstance?.config?.grainRoughness?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainRoughness = value.toFloat()
            }
        }

    override var panelY: Double
        get() = NativeFilmCameraView.activeInstance?.config?.panelY?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                panelY = value.toFloat()
            }
        }

    override var grainEnabled: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.grainEnabled ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                grainEnabled = value
            }
        }

    override var bloomEnabled: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.bloomEnabled ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                bloomEnabled = value
            }
        }

    override var blackLevel: Double
        get() = NativeFilmCameraView.activeInstance?.config?.blackLevel?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                blackLevel = value.toFloat()
            }
        }

    override var highlights: Double
        get() = NativeFilmCameraView.activeInstance?.config?.highlights?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                highlights = value.toFloat()
            }
        }

    override var pivot: Double
        get() = NativeFilmCameraView.activeInstance?.config?.pivot?.toDouble() ?: 0.5
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                pivot = value.toFloat()
            }
        }

    override var contrastAuto: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.contrastAuto ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                contrastAuto = value
            }
        }

    override var blackLevelAuto: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.blackLevelAuto ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                blackLevelAuto = value
            }
        }

    override var highlightsAuto: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.highlightsAuto ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                highlightsAuto = value
            }
        }

    override var pivotAuto: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.pivotAuto ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                pivotAuto = value
            }
        }

    override var pixelationFactor: Double
        get() = NativeFilmCameraView.activeInstance?.config?.pixelationFactor?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                pixelationFactor = value.toFloat()
            }
        }

    override var tapeJitter: Double
        get() = NativeFilmCameraView.activeInstance?.config?.tapeJitter?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                tapeJitter = value.toFloat()
            }
        }

    override var scanlines: Double
        get() = NativeFilmCameraView.activeInstance?.config?.scanlines?.toDouble() ?: 0.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                scanlines = value.toFloat()
            }
        }

    override var chromaShiftInvert: Boolean
        get() = NativeFilmCameraView.activeInstance?.config?.chromaShiftInvert ?: false
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                chromaShiftInvert = value
            }
        }
    // @@GEN_OVERRIDES_END@@
}
