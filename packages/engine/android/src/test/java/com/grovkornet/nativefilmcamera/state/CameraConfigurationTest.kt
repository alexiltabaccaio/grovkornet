package com.grovkornet.nativefilmcamera.state

import org.junit.Test
import org.junit.Assert.*

class CameraConfigurationTest {

    @Test
    fun defaultValues_areCorrect() {
        val config = CameraConfiguration()
        assertEquals(1.0f, config.saturation)
        assertEquals(50.0f, config.satRed)
        assertEquals(50.0f, config.satBlue)
        assertEquals(1.0f, config.contrast)
        assertTrue(config.isoAuto)
        assertEquals(400, config.iso)
        assertNull(config.cameraId)
        assertFalse(config.previewIn4k)
    }

    @Test
    fun stateUpdate_persistsValues() {
        val config = CameraConfiguration()
        config.iso = 800
        config.isoAuto = false
        config.saturation = 0.5f
        config.satRed = 80.0f
        config.satBlue = 20.0f
        config.previewIn4k = true
        
        assertEquals(800, config.iso)
        assertFalse(config.isoAuto)
        assertEquals(0.5f, config.saturation)
        assertEquals(80.0f, config.satRed)
        assertEquals(20.0f, config.satBlue)
        assertTrue(config.previewIn4k)
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
            vhsIntensity = 0.7f
            ev = -0.5f
            whiteBalance = 5500f
            tint = 5f
            bloomEnabled = true
            bloomIntensity = 0.4f
            aberration = 0.1f
            aberrationDirection = 90
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
        }

        val time = 123.45f
        val targetResolution = 1080f

        val array = config.toRenderParamsArray(time = time, targetResolution = targetResolution)

        assertEquals(28, array.size)
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
        assertEquals(90f, array[14])
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
        assertEquals(0f, array[27])

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
        
        // Test all valid resolutions from 0 to 6
        config.resolutionSetting = 0
        assertEquals(2160f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 1
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 2
        assertEquals(720f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 3
        assertEquals(480f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 4
        assertEquals(360f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 5
        assertEquals(240f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 6
        assertEquals(144f, config.getTargetResolutionValue(), 0.001f)
        
        // Test fallback/default cases
        config.resolutionSetting = -1
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
        
        config.resolutionSetting = 999
        assertEquals(1080f, config.getTargetResolutionValue(), 0.001f)
    }
}

