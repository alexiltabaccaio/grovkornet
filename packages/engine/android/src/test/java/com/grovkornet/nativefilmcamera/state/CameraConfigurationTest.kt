package com.grovkornet.nativefilmcamera.state

import org.junit.Test
import org.junit.Assert.*

class CameraConfigurationTest {

    @Test
    fun defaultValues_areCorrect() {
        val config = CameraConfiguration()
        assertEquals(1.0f, config.saturation)
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
        config.previewIn4k = true
        
        assertEquals(800, config.iso)
        assertFalse(config.isoAuto)
        assertEquals(0.5f, config.saturation)
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
}
