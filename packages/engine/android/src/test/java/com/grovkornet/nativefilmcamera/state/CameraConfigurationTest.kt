package com.grovkornet.nativefilmcamera.state

import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import com.grovkornet.nativefilmcamera.jni.CameraStateJNI

class CameraConfigurationTest {

    @Before
    fun setUp() {
        CameraStateJNI.fallbackClear()
    }

    @Test
    fun defaultValues_areCorrect() {
        val config = CameraConfiguration()
        val oldCam = config.cameraId
        assertEquals(1.0f, config.saturation)
        assertEquals(50.0f, config.satRed)
        assertEquals(50.0f, config.satBlue)
        assertEquals(1.0f, config.contrast)
        assertTrue(config.isoAuto)
        assertEquals(400, config.iso)
        assertNull(config.cameraId)
        assertEquals(1, config.previewQuality)
        assertEquals(1.0f, config.zoom)
        assertEquals(1.0f, config.pixelationFactor)
    }

    @Test
    fun stateUpdate_persistsValues() {
        val config = CameraConfiguration()
        config.iso = 800
        config.isoAuto = false
        config.saturation = 0.5f
        config.zoom = 2.0f
        config.satRed = 80.0f
        config.satBlue = 20.0f
        config.previewQuality = 0
        
        assertEquals(800, config.iso)
        assertFalse(config.isoAuto)
        assertEquals(0.5f, config.saturation)
        assertEquals(2.0f, config.zoom)
        assertEquals(80.0f, config.satRed)
        assertEquals(20.0f, config.satBlue)
        assertEquals(0, config.previewQuality)
        config.pixelationFactor = 4.0f
        assertEquals(4.0f, config.pixelationFactor)
    }

    @Test
    fun viewportSettings_areCorrect() {
        val config = CameraConfiguration()
        config.viewportWidth = 1920f
        config.viewportHeight = 1080f
        
        assertEquals(1920f, config.viewportWidth)
        assertEquals(1080f, config.viewportHeight)
    }

    @Test
    fun getTargetResolutionValue_mapsCorrectly() {
        val config = CameraConfiguration()
        
        // Test all valid resolutions from 0 to 7
        config.resolutionSetting = 0
        assertEquals(2160f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 1
        assertEquals(1440f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 2
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 3
        assertEquals(720f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 4
        assertEquals(480f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 5
        assertEquals(360f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 6
        assertEquals(240f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 7
        assertEquals(144f, config.getTargetResolutionValue(), 0.001f)
        
        // Test fallback/default cases
        config.resolutionSetting = -1
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 999
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
    }

    @Test
    fun loadFromMap_loadsParametersCorrectly() {
        val config = CameraConfiguration()
        val payload = mapOf(
            "saturation" to 1.5f,
            "contrast" to 1.1f,
            "grainEnabled" to true,
            "grainIntensity" to 0.7f,
            "temperature" to 4200.0f,
            "tint" to -3.0f,
            "aspectRatio" to 2,
            "aberrationInvert" to true,
            "fpsSetting" to 30
        )

        config.loadFromMap(payload)

        assertEquals(1.5f, config.saturation, 0.001f)
        assertEquals(1.1f, config.contrast, 0.001f)
        assertTrue(config.grainEnabled)
        assertEquals(0.7f, config.grainIntensity, 0.001f)
        assertEquals(4200.0f, config.temperature, 0.001f)
        assertEquals(-3.0f, config.tint, 0.001f)
        assertEquals(2, config.aspectRatio) // mapped from "aspectRatio"
        assertTrue(config.aberrationInvert)
        assertEquals(30, config.targetFps) // mapped from "fpsSetting"
    }

    @Test
    fun exerciseAllProperties_fallbackGettersAndSetters() {
        val config = CameraConfiguration(12345L)
        
        // Floats
        config.saturation = 1.5f
        assertEquals(1.5f, config.saturation, 0.001f)
        config.contrast = 1.2f
        assertEquals(1.2f, config.contrast, 0.001f)
        config.grainIntensity = 0.5f
        assertEquals(0.5f, config.grainIntensity, 0.001f)
        config.grainChroma = 0.4f
        assertEquals(0.4f, config.grainChroma, 0.001f)
        config.grainSize = 1.8f
        assertEquals(1.8f, config.grainSize, 0.001f)
        config.grainSpeed = 24f
        assertEquals(24f, config.grainSpeed, 0.001f)
        config.vignetteIntensity = 0.6f
        assertEquals(0.6f, config.vignetteIntensity, 0.001f)
        config.chromaShift = 0.3f
        assertEquals(0.3f, config.chromaShift, 0.001f)
        config.temperature = 5500f
        assertEquals(5500f, config.temperature, 0.001f)
        config.tint = 2.5f
        assertEquals(2.5f, config.tint, 0.001f)
        config.bloomIntensity = 0.8f
        assertEquals(0.8f, config.bloomIntensity, 0.001f)
        config.halationIntensity = 0.75f
        assertEquals(0.75f, config.halationIntensity, 0.001f)
        config.halationThreshold = 0.5f
        assertEquals(0.5f, config.halationThreshold, 0.001f)
        config.bloomThreshold = 0.5f
        assertEquals(0.5f, config.bloomThreshold, 0.001f)
        config.aberration = 0.7f
        assertEquals(0.7f, config.aberration, 0.001f)
        config.sharpening = 0.9f
        assertEquals(0.9f, config.sharpening, 0.001f)
        config.satRed = 60f
        assertEquals(60f, config.satRed, 0.001f)
        config.satOrange = 55f
        assertEquals(55f, config.satOrange, 0.001f)
        config.satYellow = 45f
        assertEquals(45f, config.satYellow, 0.001f)
        config.satGreen = 40f
        assertEquals(40f, config.satGreen, 0.001f)
        config.satCyan = 35f
        assertEquals(35f, config.satCyan, 0.001f)
        config.satBlue = 30f
        assertEquals(30f, config.satBlue, 0.001f)
        config.satPurple = 25f
        assertEquals(25f, config.satPurple, 0.001f)
        config.satMagenta = 20f
        assertEquals(20f, config.satMagenta, 0.001f)
        config.boundMagentaRed = 1.1f
        assertEquals(1.1f, config.boundMagentaRed, 0.001f)
        config.boundRedOrange = 1.2f
        assertEquals(1.2f, config.boundRedOrange, 0.001f)
        config.boundOrangeYellow = 1.3f
        assertEquals(1.3f, config.boundOrangeYellow, 0.001f)
        config.boundYellowGreen = 1.4f
        assertEquals(1.4f, config.boundYellowGreen, 0.001f)
        config.boundGreenCyan = 1.5f
        assertEquals(1.5f, config.boundGreenCyan, 0.001f)
        config.boundCyanBlue = 1.6f
        assertEquals(1.6f, config.boundCyanBlue, 0.001f)
        config.boundBluePurple = 1.7f
        assertEquals(1.7f, config.boundBluePurple, 0.001f)
        config.boundPurpleMagenta = 1.8f
        assertEquals(1.8f, config.boundPurpleMagenta, 0.001f)
        config.grainRoughness = 0.95f
        assertEquals(0.95f, config.grainRoughness, 0.001f)
        config.panelY = 150f
        assertEquals(150f, config.panelY, 0.001f)
        config.blackLevel = 0.05f
        assertEquals(0.05f, config.blackLevel, 0.001f)
        config.highlights = 0.95f
        assertEquals(0.95f, config.highlights, 0.001f)
        config.pivot = 0.45f
        assertEquals(0.45f, config.pivot, 0.001f)
        config.pixelationFactor = 2.5f
        assertEquals(2.5f, config.pixelationFactor, 0.001f)
        config.tapeJitter = 0.12f
        assertEquals(0.12f, config.tapeJitter, 0.001f)
        config.scanlines = 0.75f
        assertEquals(0.75f, config.scanlines, 0.001f)
        config.hue = 180f
        assertEquals(180f, config.hue, 0.001f)
        config.hueRed = 10f
        assertEquals(10f, config.hueRed, 0.001f)
        config.hueOrange = 20f
        assertEquals(20f, config.hueOrange, 0.001f)
        config.hueYellow = 30f
        assertEquals(30f, config.hueYellow, 0.001f)
        config.hueGreen = 40f
        assertEquals(40f, config.hueGreen, 0.001f)
        config.hueCyan = 50f
        assertEquals(50f, config.hueCyan, 0.001f)
        config.hueBlue = 60f
        assertEquals(60f, config.hueBlue, 0.001f)
        config.huePurple = 70f
        assertEquals(70f, config.huePurple, 0.001f)
        config.hueMagenta = 80f
        assertEquals(80f, config.hueMagenta, 0.001f)
        config.scanlinesDensity = 2.2f
        assertEquals(2.2f, config.scanlinesDensity, 0.001f)
        config.lensDistortion = 0.08f
        assertEquals(0.08f, config.lensDistortion, 0.001f)
        config.ev = -0.5f
        assertEquals(-0.5f, config.ev, 0.001f)
        config.focusDistance = 1.4f
        assertEquals(1.4f, config.focusDistance, 0.001f)
        config.zoom = 3.5f
        assertEquals(3.5f, config.zoom, 0.001f)
        config.viewportWidth = 2000f
        assertEquals(2000f, config.viewportWidth, 0.001f)
        config.viewportHeight = 1200f
        assertEquals(1200f, config.viewportHeight, 0.001f)

        // Ints
        config.chromaShiftDirection = 1
        assertEquals(1, config.chromaShiftDirection)
        config.scanlinesMode = 2
        assertEquals(2, config.scanlinesMode)
        config.targetFps = 24
        assertEquals(24, config.targetFps)
        config.aspectRatio = 3
        assertEquals(3, config.aspectRatio)
        config.noiseReduction = 4
        assertEquals(4, config.noiseReduction)
        config.iso = 800
        assertEquals(800, config.iso)
        config.torchStrength = 5
        assertEquals(5, config.torchStrength)
        config.resolutionSetting = 6
        assertEquals(6, config.resolutionSetting)
        config.previewQuality = 7
        assertEquals(7, config.previewQuality)

        // Longs
        config.exposureTime = 2000000L
        assertEquals(2000000L, config.exposureTime)

        // Booleans
        config.aberrationInvert = true
        assertTrue(config.aberrationInvert)
        config.grainEnabled = true
        assertTrue(config.grainEnabled)
        config.bloomEnabled = true
        assertTrue(config.bloomEnabled)
        config.halationEnabled = true
        assertTrue(config.halationEnabled)
        config.contrastAuto = true
        assertTrue(config.contrastAuto)
        config.blackLevelAuto = true
        assertTrue(config.blackLevelAuto)
        config.highlightsAuto = true
        assertTrue(config.highlightsAuto)
        config.pivotAuto = true
        assertTrue(config.pivotAuto)
        config.chromaShiftInvert = true
        assertTrue(config.chromaShiftInvert)
        config.scanlinesHorizontal = true
        assertTrue(config.scanlinesHorizontal)
        config.isoAuto = true
        assertTrue(config.isoAuto)
        config.shutterSpeedAuto = true
        assertTrue(config.shutterSpeedAuto)
        config.noiseReductionAuto = true
        assertTrue(config.noiseReductionAuto)
        config.temperatureAuto = true
        assertTrue(config.temperatureAuto)
        config.autoFocus = true
        assertTrue(config.autoFocus)
        config.torchEnabled = true
        assertTrue(config.torchEnabled)
        config.force60fpsCrop = true
        assertTrue(config.force60fpsCrop)
        config.secureViewEnabled = true
        assertTrue(config.secureViewEnabled)
        config.isSelfieCamera = true
        assertTrue(config.isSelfieCamera)

        // Strings
        config.cameraId = "test_back_camera"
        assertEquals("test_back_camera", config.cameraId)
    }

    @Test
    fun loadFromMap_exercisesAllProperties() {
        val config = CameraConfiguration(54321L)
        val payload = mapOf(
            "saturation" to 1.8f,
            "contrast" to 1.4f,
            "grainIntensity" to 0.6f,
            "grainChroma" to 0.3f,
            "grainSize" to 1.7f,
            "grainSpeed" to 15f,
            "vignetteIntensity" to 0.4f,
            "chromaShift" to 0.25f,
            "temperature" to 4800f,
            "tint" to 1.5f,
            "bloomIntensity" to 0.7f,
            "halationIntensity" to 0.45f,
            "halationThreshold" to 0.65f,
            "bloomThreshold" to 0.25f,
            "halationEnabled" to true,
            "chromaticAberration" to 0.35f,
            "chromaShiftDirection" to 2,
            "sharpening" to 0.85f,
            "satRed" to 40f,
            "satOrange" to 42f,
            "satYellow" to 44f,
            "satGreen" to 46f,
            "satCyan" to 48f,
            "satBlue" to 52f,
            "satPurple" to 54f,
            "satMagenta" to 56f,
            "aberrationInvert" to false,
            "boundMagentaRed" to 0.8f,
            "boundRedOrange" to 0.9f,
            "boundOrangeYellow" to 1.0f,
            "boundYellowGreen" to 1.1f,
            "boundGreenCyan" to 1.2f,
            "boundCyanBlue" to 1.3f,
            "boundBluePurple" to 1.4f,
            "boundPurpleMagenta" to 1.5f,
            "grainRoughness" to 0.88f,
            "panelY" to 120f,
            "grainEnabled" to false,
            "bloomEnabled" to false,
            "blackLevel" to 0.04f,
            "highlights" to 0.92f,
            "pivot" to 0.42f,
            "contrastAuto" to false,
            "blackLevelAuto" to false,
            "highlightsAuto" to false,
            "pivotAuto" to false,
            "pixelationFactor" to 1.5f,
            "tapeJitter" to 0.08f,
            "scanlines" to 0.6f,
            "chromaShiftInvert" to false,
            "hue" to 120f,
            "hueRed" to 5f,
            "hueOrange" to 15f,
            "hueYellow" to 25f,
            "hueGreen" to 35f,
            "hueCyan" to 45f,
            "hueBlue" to 55f,
            "huePurple" to 65f,
            "hueMagenta" to 75f,
            "scanlinesHorizontal" to false,
            "scanlinesMode" to 1,
            "scanlinesDensity" to 1.8f,
            "lensDistortion" to 0.05f,
            "viewportWidth" to 1920f,
            "viewportHeight" to 1080f
        )

        config.loadFromMap(payload)

        assertEquals(1.8f, config.saturation, 0.001f)
        assertEquals(1.4f, config.contrast, 0.001f)
        assertEquals(0.6f, config.grainIntensity, 0.001f)
        assertEquals(0.3f, config.grainChroma, 0.001f)
        assertEquals(1.7f, config.grainSize, 0.001f)
        assertEquals(15f, config.grainSpeed, 0.001f)
        assertEquals(0.4f, config.vignetteIntensity, 0.001f)
        assertEquals(0.25f, config.chromaShift, 0.001f)
        assertEquals(4800f, config.temperature, 0.001f)
        assertEquals(1.5f, config.tint, 0.001f)
        assertEquals(0.7f, config.bloomIntensity, 0.001f)
        assertEquals(0.45f, config.halationIntensity, 0.001f)
        assertEquals(0.65f, config.halationThreshold, 0.001f)
        assertEquals(0.25f, config.bloomThreshold, 0.001f)
        assertTrue(config.halationEnabled)
        assertEquals(0.35f, config.aberration, 0.001f)
        assertEquals(2, config.chromaShiftDirection)
        assertEquals(0.85f, config.sharpening, 0.001f)
        assertEquals(40f, config.satRed, 0.001f)
        assertEquals(42f, config.satOrange, 0.001f)
        assertEquals(44f, config.satYellow, 0.001f)
        assertEquals(46f, config.satGreen, 0.001f)
        assertEquals(48f, config.satCyan, 0.001f)
        assertEquals(52f, config.satBlue, 0.001f)
        assertEquals(54f, config.satPurple, 0.001f)
        assertEquals(56f, config.satMagenta, 0.001f)
        assertFalse(config.aberrationInvert)
        assertEquals(0.8f, config.boundMagentaRed, 0.001f)
        assertEquals(0.9f, config.boundRedOrange, 0.001f)
        assertEquals(1.0f, config.boundOrangeYellow, 0.001f)
        assertEquals(1.1f, config.boundYellowGreen, 0.001f)
        assertEquals(1.2f, config.boundGreenCyan, 0.001f)
        assertEquals(1.3f, config.boundCyanBlue, 0.001f)
        assertEquals(1.4f, config.boundBluePurple, 0.001f)
        assertEquals(1.5f, config.boundPurpleMagenta, 0.001f)
        assertEquals(0.88f, config.grainRoughness, 0.001f)
        assertEquals(120f, config.panelY, 0.001f)
        assertFalse(config.grainEnabled)
        assertFalse(config.bloomEnabled)
        assertEquals(0.04f, config.blackLevel, 0.001f)
        assertEquals(0.92f, config.highlights, 0.001f)
        assertEquals(0.42f, config.pivot, 0.001f)
        assertFalse(config.contrastAuto)
        assertFalse(config.blackLevelAuto)
        assertFalse(config.highlightsAuto)
        assertFalse(config.pivotAuto)
        assertEquals(1.5f, config.pixelationFactor, 0.001f)
        assertEquals(0.08f, config.tapeJitter, 0.001f)
        assertEquals(0.6f, config.scanlines, 0.001f)
        assertFalse(config.chromaShiftInvert)
        assertEquals(120f, config.hue, 0.001f)
        assertEquals(5f, config.hueRed, 0.001f)
        assertEquals(15f, config.hueOrange, 0.001f)
        assertEquals(25f, config.hueYellow, 0.001f)
        assertEquals(35f, config.hueGreen, 0.001f)
        assertEquals(45f, config.hueCyan, 0.001f)
        assertEquals(55f, config.hueBlue, 0.001f)
        assertEquals(65f, config.huePurple, 0.001f)
        assertEquals(75f, config.hueMagenta, 0.001f)
        assertFalse(config.scanlinesHorizontal)
        assertEquals(1, config.scanlinesMode)
        assertEquals(1.8f, config.scanlinesDensity, 0.001f)
        assertEquals(0.05f, config.lensDistortion, 0.001f)
        assertEquals(1920f, config.viewportWidth, 0.001f)
        assertEquals(1080f, config.viewportHeight, 0.001f)
    }
}

