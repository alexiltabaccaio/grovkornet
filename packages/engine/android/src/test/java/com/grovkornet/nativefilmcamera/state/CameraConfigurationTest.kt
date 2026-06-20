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
}

