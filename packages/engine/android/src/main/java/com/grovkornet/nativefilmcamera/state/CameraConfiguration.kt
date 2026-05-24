package com.grovkornet.nativefilmcamera.state

/**
 * Single source of truth for all camera and rendering parameters.
 */
data class CameraConfiguration(
    // Rendering / Effect Props
    var saturation: Float = 1.0f,
    var satRed: Float = 50.0f,
    var satOrange: Float = 50.0f,
    var satYellow: Float = 50.0f,
    var satGreen: Float = 50.0f,
    var satCyan: Float = 50.0f,
    var satBlue: Float = 50.0f,
    var satPurple: Float = 50.0f,
    var satMagenta: Float = 50.0f,
    var contrast: Float = 1.0f,
    var grainIntensity: Float = 0.0f,
    var grainChroma: Float = 0.0f,
    var grainSize: Float = 1.0f,
    var grainSpeed: Float = 1.0f,
    var grainEnabled: Boolean = true,
    var aberration: Float = 0.0f,
    var aberrationDirection: Int = 0,
    var whiteBalance: Float = 5000.0f,
    var tint: Float = 0.0f,
    var sharpening: Float = 0.0f,
    var vignetteIntensity: Float = 0.0f,
    var vhsIntensity: Float = 0.0f,
    var bloomEnabled: Boolean = false,
    var bloomIntensity: Float = 0.35f,

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
    var aspectRatio: Int = 1,
    var resolutionSetting: Int = 1,
    var previewIn4k: Boolean = false,
    var targetFps: Int = 60,

    // Viewport Props
    var viewportWidth: Float = 1080f,
    var viewportHeight: Float = 1920f
)

fun CameraConfiguration.getTargetResolutionValue(): Float {
    return when (resolutionSetting) {
        0 -> 2160f
        1 -> 1080f
        2 -> 720f
        3 -> 480f
        4 -> 360f
        5 -> 240f
        6 -> 144f
        else -> 1080f
    }
}

fun CameraConfiguration.toRenderParamsArray(
    time: Float = 0f,
    targetResolution: Float = 0f,
    targetFpsOverride: Float = targetFps.toFloat()
): FloatArray = FloatArray(27).apply {
    this[0]  = saturation
    this[1]  = contrast
    this[2]  = if (grainEnabled) grainIntensity else 0f
    this[3]  = grainChroma
    this[4]  = grainSize
    this[5]  = grainSpeed
    this[6]  = vignetteIntensity
    this[7]  = vhsIntensity
    this[8]  = time
    this[9]  = ev
    this[10] = whiteBalance
    this[11] = tint
    this[12] = if (bloomEnabled) bloomIntensity else 0f
    this[13] = aberration
    this[14] = aberrationDirection.toFloat()
    this[15] = sharpening
    this[16] = satRed
    this[17] = satOrange
    this[18] = satYellow
    this[19] = satGreen
    this[20] = satCyan
    this[21] = satBlue
    this[22] = satPurple
    this[23] = satMagenta
    this[24] = targetFpsOverride
    this[25] = aspectRatio.toFloat()
    this[26] = targetResolution
}

