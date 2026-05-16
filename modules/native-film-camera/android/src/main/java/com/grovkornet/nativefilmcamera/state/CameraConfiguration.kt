package com.grovkornet.nativefilmcamera.state

/**
 * Single source of truth for all camera and rendering parameters.
 */
data class CameraConfiguration(
    // Rendering / Effect Props
    var saturation: Float = 1.0f,
    var contrast: Float = 1.0f,
    var grainIntensity: Float = 0.0f,
    var grainChroma: Float = 0.0f,
    var grainSize: Float = 1.0f,
    var grainEnabled: Boolean = true,
    var aberration: Float = 0.0f,
    var aberrationDirection: Int = 0,
    var whiteBalance: Float = 5000.0f,
    var sharpening: Float = 0.0f,

    // Hardware Props
    var ev: Float = 0.0f,
    var noiseReduction: Int = 1,
    var isoAuto: Boolean = true,
    var shutterSpeedAuto: Boolean = true,
    var whiteBalanceAuto: Boolean = true,
    var autoFocus: Boolean = false,
    var iso: Int = 400,
    var exposureTime: Long = 1000000000L / 60,
    var focusDistance: Float = 0.0f,
    var torchEnabled: Boolean = false,
    var torchStrength: Int = 1,
    var cameraId: String? = null,
    var aspectRatio: Int = 0,

    // Viewport Props
    var viewportWidth: Float = 1080f,
    var viewportHeight: Float = 1920f
)
