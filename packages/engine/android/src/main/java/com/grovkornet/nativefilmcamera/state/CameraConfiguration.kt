package com.grovkornet.nativefilmcamera.state

/**
 * Single source of truth for all camera and rendering parameters.
 */
data class CameraConfiguration(
    // @@GEN_FIELDS_START@@
    // Rendering / Effect Props
    var saturation: Float = 1.0f,
    var contrast: Float = 1.0f,
    var grainIntensity: Float = 0.0f,
    var grainChroma: Float = 0.0f,
    var grainSize: Float = 1.0f,
    var grainSpeed: Float = 20.0f,
    var vignetteIntensity: Float = 0.0f,
    var chromaShift: Float = 0.0f,
    var whiteBalance: Float = 5000.0f,
    var tint: Float = 0.0f,
    var bloomIntensity: Float = 0.0f,
    var aberration: Float = 0.0f,
    var chromaShiftDirection: Int = 0,
    var sharpening: Float = 0.0f,
    var satRed: Float = 50.0f,
    var satOrange: Float = 50.0f,
    var satYellow: Float = 50.0f,
    var satGreen: Float = 50.0f,
    var satCyan: Float = 50.0f,
    var satBlue: Float = 50.0f,
    var satPurple: Float = 50.0f,
    var satMagenta: Float = 50.0f,
    var aberrationInvert: Boolean = false,
    var boundMagentaRed: Float = 350.0f,
    var boundRedOrange: Float = 40.0f,
    var boundOrangeYellow: Float = 70.0f,
    var boundYellowGreen: Float = 110.0f,
    var boundGreenCyan: Float = 170.0f,
    var boundCyanBlue: Float = 230.0f,
    var boundBluePurple: Float = 280.0f,
    var boundPurpleMagenta: Float = 315.0f,
    var grainRoughness: Float = 0.0f,
    var panelY: Float = 1.0f,
    var grainEnabled: Boolean = false,
    var bloomEnabled: Boolean = false,
    var blackLevel: Float = 0.0f,
    var highlights: Float = 1.0f,
    var pivot: Float = 0.5f,
    var contrastAuto: Boolean = true,
    var blackLevelAuto: Boolean = true,
    var highlightsAuto: Boolean = true,
    var pivotAuto: Boolean = true,
    var pixelationFactor: Float = 1.0f,
    var tapeJitter: Float = 0.0f,
    var scanlines: Float = 0.0f,
    var chromaShiftInvert: Boolean = false,
    var hue: Float = 0.0f,
    var hueRed: Float = 0.0f,
    var hueOrange: Float = 0.0f,
    var hueYellow: Float = 0.0f,
    var hueGreen: Float = 0.0f,
    var hueCyan: Float = 0.0f,
    var hueBlue: Float = 0.0f,
    var huePurple: Float = 0.0f,
    var hueMagenta: Float = 0.0f,
    var scanlinesHorizontal: Boolean = true,
    var scanlinesMode: Int = 0,
    var scanlinesDensity: Float = 800.0f,

    // Hardware Props
    var ev: Float = 0.0f,
    var targetFps: Int = 60,
    var aspectRatio: Int = 1,
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
    var resolutionSetting: Int = 2,
    var previewQuality: Int = 1,
    var force60fpsCrop: Boolean = true,
    var secureViewEnabled: Boolean = false,
    var isSelfieCamera: Boolean = false,
    var zoom: Float = 1.0f,

    // Viewport Props
    var viewportWidth: Float = 1080f,
    var viewportHeight: Float = 1920f
    // @@GEN_FIELDS_END@@
)

fun CameraConfiguration.getTargetResolutionValue(): Float {
    return when (resolutionSetting) {
        0 -> 2160f
        1 -> 1440f
        2 -> 1080f
        3 -> 720f
        4 -> 480f
        5 -> 360f
        6 -> 240f
        7 -> 144f
        else -> 1080f
    }
}

fun CameraConfiguration.toRenderParamsArray(
    time: Float = 0f,
    targetResolution: Float = 0f,
    targetFpsOverride: Float = targetFps.toFloat(),
    invertYShift: Boolean = false
): FloatArray = // @@GEN_ARRAY_START@@
FloatArray(61).apply {
    this[0 ] = saturation
    this[1 ] = contrast
    this[2 ] = if (grainEnabled) grainIntensity else 0f
    this[3 ] = grainChroma
    this[4 ] = grainSize
    this[5 ] = grainSpeed
    this[6 ] = vignetteIntensity
    this[7 ] = chromaShift
    this[8 ] = time
    this[9 ] = ev
    this[10] = whiteBalance
    this[11] = tint
    this[12] = if (bloomEnabled) bloomIntensity else 0f
    this[13] = aberration
    this[14] = chromaShiftDirection.toFloat()
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
    this[27] = if (invertYShift) 1.0f else 0.0f
    this[28] = if (aberrationInvert) 1.0f else 0.0f
    this[29] = boundMagentaRed
    this[30] = boundRedOrange
    this[31] = boundOrangeYellow
    this[32] = boundYellowGreen
    this[33] = boundGreenCyan
    this[34] = boundCyanBlue
    this[35] = boundBluePurple
    this[36] = boundPurpleMagenta
    this[37] = grainRoughness
    this[38] = panelY
    this[39] = blackLevel
    this[40] = highlights
    this[41] = pivot
    this[42] = if (contrastAuto) 1.0f else 0.0f
    this[43] = if (blackLevelAuto) 1.0f else 0.0f
    this[44] = if (highlightsAuto) 1.0f else 0.0f
    this[45] = if (pivotAuto) 1.0f else 0.0f
    this[46] = pixelationFactor
    this[47] = tapeJitter
    this[48] = scanlines
    this[49] = if (chromaShiftInvert) 1.0f else 0.0f
    this[50] = hue
    this[51] = hueRed
    this[52] = hueOrange
    this[53] = hueYellow
    this[54] = hueGreen
    this[55] = hueCyan
    this[56] = hueBlue
    this[57] = huePurple
    this[58] = hueMagenta
    this[59] = if (scanlinesHorizontal) 1.0f else 0.0f
    this[60] = scanlinesDensity
}
// @@GEN_ARRAY_END@@

fun CameraConfiguration.loadFromMap(payload: Map<String, Any>) {
    // @@GEN_MAP_LOADER_START@@
    payload["ev"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { ev = it }
    }
    val raw_targetFps = payload["fpsSetting"] ?: payload["targetFps"]
    raw_targetFps?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { targetFps = it }
    }
    val raw_aspectRatio = payload["aspectRatio"] ?: payload["cameraAspectRatio"]
    raw_aspectRatio?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { aspectRatio = it }
    }
    val raw_noiseReduction = payload["noiseReductionMode"] ?: payload["noiseReduction"]
    raw_noiseReduction?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { noiseReduction = it }
    }
    payload["isoAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { isoAuto = it }
    }
    payload["shutterSpeedAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { shutterSpeedAuto = it }
    }
    val raw_whiteBalanceAuto = payload["temperatureAuto"] ?: payload["whiteBalanceAuto"]
    raw_whiteBalanceAuto?.let { rawValue ->
        (rawValue as? Boolean)?.let { whiteBalanceAuto = it }
    }
    val raw_autoFocus = payload["focusAuto"] ?: payload["autoFocus"]
    raw_autoFocus?.let { rawValue ->
        (rawValue as? Boolean)?.let { autoFocus = it }
    }
    payload["iso"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { iso = it }
    }
    val raw_exposureTime = payload["shutterSpeed"] ?: payload["exposureTime"]
    raw_exposureTime?.let { rawValue ->
        (rawValue as? Number)?.toLong()?.let { exposureTime = it }
    }
    payload["focusDistance"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { focusDistance = it }
    }
    val raw_torchEnabled = payload["torchState"] ?: payload["torchEnabled"]
    raw_torchEnabled?.let { rawValue ->
        (rawValue as? Boolean)?.let { torchEnabled = it }
    }
    payload["torchStrength"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { torchStrength = it }
    }
    payload["cameraId"]?.let { rawValue ->
        (rawValue as? String)?.let { cameraId = it }
    }
    payload["resolutionSetting"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { resolutionSetting = it }
    }
    payload["previewQuality"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { previewQuality = it }
    }
    payload["force60fpsCrop"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { force60fpsCrop = it }
    }
    payload["secureViewEnabled"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { secureViewEnabled = it }
    }
    payload["isSelfieCamera"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { isSelfieCamera = it }
    }
    payload["zoom"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { zoom = it }
    }
    payload["saturation"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { saturation = it }
    }
    payload["contrast"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { contrast = it }
    }
    payload["grainIntensity"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { grainIntensity = it }
    }
    payload["grainChroma"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { grainChroma = it }
    }
    payload["grainSize"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { grainSize = it }
    }
    payload["grainSpeed"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { grainSpeed = it }
    }
    payload["vignetteIntensity"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { vignetteIntensity = it }
    }
    payload["chromaShift"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { chromaShift = it }
    }
    val raw_whiteBalance = payload["temperature"] ?: payload["whiteBalance"]
    raw_whiteBalance?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { whiteBalance = it }
    }
    payload["tint"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { tint = it }
    }
    payload["bloomIntensity"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { bloomIntensity = it }
    }
    payload["chromaticAberration"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { aberration = it }
    }
    payload["chromaShiftDirection"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { chromaShiftDirection = it }
    }
    payload["sharpening"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { sharpening = it }
    }
    payload["satRed"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satRed = it }
    }
    payload["satOrange"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satOrange = it }
    }
    payload["satYellow"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satYellow = it }
    }
    payload["satGreen"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satGreen = it }
    }
    payload["satCyan"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satCyan = it }
    }
    payload["satBlue"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satBlue = it }
    }
    payload["satPurple"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satPurple = it }
    }
    payload["satMagenta"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { satMagenta = it }
    }
    payload["aberrationInvert"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { aberrationInvert = it }
    }
    payload["boundMagentaRed"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundMagentaRed = it }
    }
    payload["boundRedOrange"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundRedOrange = it }
    }
    payload["boundOrangeYellow"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundOrangeYellow = it }
    }
    payload["boundYellowGreen"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundYellowGreen = it }
    }
    payload["boundGreenCyan"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundGreenCyan = it }
    }
    payload["boundCyanBlue"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundCyanBlue = it }
    }
    payload["boundBluePurple"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundBluePurple = it }
    }
    payload["boundPurpleMagenta"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { boundPurpleMagenta = it }
    }
    payload["grainRoughness"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { grainRoughness = it }
    }
    payload["panelY"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { panelY = it }
    }
    payload["grainEnabled"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { grainEnabled = it }
    }
    payload["bloomEnabled"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { bloomEnabled = it }
    }
    payload["blackLevel"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { blackLevel = it }
    }
    payload["highlights"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { highlights = it }
    }
    payload["pivot"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { pivot = it }
    }
    payload["contrastAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { contrastAuto = it }
    }
    payload["blackLevelAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { blackLevelAuto = it }
    }
    payload["highlightsAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { highlightsAuto = it }
    }
    payload["pivotAuto"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { pivotAuto = it }
    }
    payload["pixelationFactor"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { pixelationFactor = it }
    }
    payload["tapeJitter"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { tapeJitter = it }
    }
    payload["scanlines"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { scanlines = it }
    }
    payload["chromaShiftInvert"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { chromaShiftInvert = it }
    }
    payload["hue"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hue = it }
    }
    payload["hueRed"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueRed = it }
    }
    payload["hueOrange"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueOrange = it }
    }
    payload["hueYellow"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueYellow = it }
    }
    payload["hueGreen"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueGreen = it }
    }
    payload["hueCyan"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueCyan = it }
    }
    payload["hueBlue"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueBlue = it }
    }
    payload["huePurple"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { huePurple = it }
    }
    payload["hueMagenta"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { hueMagenta = it }
    }
    payload["scanlinesHorizontal"]?.let { rawValue ->
        (rawValue as? Boolean)?.let { scanlinesHorizontal = it }
    }
    payload["scanlinesMode"]?.let { rawValue ->
        (rawValue as? Number)?.toInt()?.let { scanlinesMode = it }
    }
    payload["scanlinesDensity"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { scanlinesDensity = it }
    }
    payload["viewportWidth"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { viewportWidth = it }
    }
    payload["viewportHeight"]?.let { rawValue ->
        (rawValue as? Number)?.toFloat()?.let { viewportHeight = it }
    }
    // @@GEN_MAP_LOADER_END@@
}
