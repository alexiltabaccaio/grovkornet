package com.grovkornet.nativefilmcamera.state

import org.junit.Test
import org.junit.Assert.*

class CameraConfigurationTest {

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
    fun toRenderParamsArray_producesCorrectArray() {
        val config = CameraConfiguration().apply {
            saturation = 1.2f
            contrast = 0.9f
            grainEnabled = true
            grainIntensity = 0.5f
            grainChroma = 0.3f
            grainSize = 1.1f
            grainSpeed = 2.0f
            vignetteIntensity = 0.15f
            chromaShift = 0.7f
            ev = -0.5f
            whiteBalance = 5500f
            tint = 5f
            bloomEnabled = true
            bloomIntensity = 0.4f
            aberration = 0.1f
            chromaShiftDirection = 1
            aberrationInvert = true
            chromaShiftInvert = true
            sharpening = 0.8f
            satRed = 45f
            satOrange = 46f
            satYellow = 47f
            satGreen = 48f
            satCyan = 49f
            satBlue = 51f
            satPurple = 52f
            satMagenta = 53f
            targetFps = 30
            aspectRatio = 2
            boundMagentaRed = 340f
            boundRedOrange = 50f
            boundOrangeYellow = 85f
            boundYellowGreen = 120f
            boundGreenCyan = 175f
            boundCyanBlue = 225f
            boundBluePurple = 285f
            boundPurpleMagenta = 310f
            grainRoughness = 0.7f
            panelY = 0.85f
            tapeJitter = 0.2f
            scanlines = 0.3f
        }

        val time = 123.45f
        val targetResolution = 1080f

        val array = config.toRenderParamsArray(time = time, targetResolution = targetResolution)

        assertEquals(61, array.size)
        assertEquals(1.2f, array[0])
        assertEquals(0.9f, array[1])
        assertEquals(0.5f, array[2])
        assertEquals(0.3f, array[3])
        assertEquals(1.1f, array[4])
        assertEquals(2.0f, array[5])
        assertEquals(0.15f, array[6])
        assertEquals(0.7f, array[7])
        assertEquals(time, array[8])
        assertEquals(-0.5f, array[9])
        assertEquals(5500f, array[10])
        assertEquals(5f, array[11])
        assertEquals(0.4f, array[12])
        assertEquals(0.1f, array[13])
        assertEquals(1.0f, array[14]) // chromaShiftDirection
        assertEquals(0.8f, array[15])
        assertEquals(45f, array[16])
        assertEquals(46f, array[17])
        assertEquals(47f, array[18])
        assertEquals(48f, array[19])
        assertEquals(49f, array[20])
        assertEquals(51f, array[21])
        assertEquals(52f, array[22])
        assertEquals(53f, array[23])
        assertEquals(30f, array[24])
        assertEquals(2f, array[25])
        assertEquals(1080f, array[26])
        assertEquals(0f, array[27]) // invertYShift
        assertEquals(1.0f, array[28]) // aberrationInvert (true -> 1.0f)
        assertEquals(340f, array[29]) // boundMagentaRed
        assertEquals(50f, array[30]) // boundRedOrange
        assertEquals(85f, array[31]) // boundOrangeYellow
        assertEquals(120f, array[32]) // boundYellowGreen
        assertEquals(175f, array[33]) // boundGreenCyan
        assertEquals(225f, array[34]) // boundCyanBlue
        assertEquals(285f, array[35]) // boundBluePurple
        assertEquals(310f, array[36]) // boundPurpleMagenta
        assertEquals(0.7f, array[37]) // grainRoughness
        assertEquals(0.85f, array[38]) // panelY
        assertEquals(0.0f, array[39]) // blackLevel
        assertEquals(1.0f, array[40]) // highlights
        assertEquals(0.5f, array[41]) // pivot
        assertEquals(1.0f, array[42]) // contrastAuto
        assertEquals(1.0f, array[43]) // blackLevelAuto
        assertEquals(1.0f, array[44]) // highlightsAuto
        assertEquals(1.0f, array[45]) // pivotAuto
        assertEquals(1.0f, array[46]) // pixelationFactor
        assertEquals(0.2f, array[47]) // tapeJitter
        assertEquals(0.3f, array[48]) // scanlines
        assertEquals(1.0f, array[49]) // chromaShiftInvert (true -> 1.0f)
        assertEquals(0.0f, array[50]) // hue
        assertEquals(0.0f, array[51]) // hueRed
        assertEquals(0.0f, array[52]) // hueOrange
        assertEquals(0.0f, array[53]) // hueYellow
        assertEquals(0.0f, array[54]) // hueGreen
        assertEquals(0.0f, array[55]) // hueCyan
        assertEquals(0.0f, array[56]) // hueBlue
        assertEquals(0.0f, array[57]) // huePurple
        assertEquals(0.0f, array[58]) // hueMagenta
        assertEquals(1.0f, array[59]) // scanlinesHorizontal (true -> 1.0f)
        assertEquals(800.0f, array[60]) // scanlinesDensity

        // Test dynamic disabling features
        config.grainEnabled = false
        config.bloomEnabled = false
        val disabledArray = config.toRenderParamsArray()
        assertEquals(0f, disabledArray[2]) // grainIntensity should be 0f when disabled
        assertEquals(0f, disabledArray[12]) // bloomIntensity should be 0f when disabled
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
        assertEquals(4200.0f, config.whiteBalance, 0.001f) // mapped from "temperature"
        assertEquals(-3.0f, config.tint, 0.001f)
        assertEquals(2, config.aspectRatio) // mapped from "aspectRatio"
        assertTrue(config.aberrationInvert)
        assertEquals(30, config.targetFps) // mapped from "fpsSetting"
    }
}

