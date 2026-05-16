package com.grovkornet.nativefilmcamera.logic

import org.junit.Test
import org.junit.Assert.*

class CameraLogicUtilsTest {

    @Test
    fun calculateEquivalentFocalLength_isCorrectForFullFrame() {
        // Sensor size for 35mm full frame is roughly 36x24mm
        val focalLength = 50.0f
        val sensorWidth = 36.0
        val sensorHeight = 24.0
        
        val result = CameraLogicUtils.calculateEquivalentFocalLength(focalLength, sensorWidth, sensorHeight)
        
        // Diagonal of 36x24 is ~43.27. 
        // Result should be exactly 50 since DIAGONAL_35MM is 43.27
        assertEquals(50.0, result, 0.1)
    }

    @Test
    fun calculateEquivalentFocalLength_isCorrectForAPS_C() {
        // Typical APS-C sensor (1.5x crop)
        val focalLength = 35.0f
        val sensorWidth = 23.6
        val sensorHeight = 15.7
        
        val result = CameraLogicUtils.calculateEquivalentFocalLength(focalLength, sensorWidth, sensorHeight)
        
        // 35mm * 1.5 crop = 52.5mm
        assertEquals(52.5, result, 1.0)
    }

    @Test
    fun calculateEquivalentFocalLength_isCorrectForSmallSensor() {
        // iPhone-like sensor (~1/2.55")
        val focalLength = 4.0f
        val sensorWidth = 5.7
        val sensorHeight = 4.3
        
        val result = CameraLogicUtils.calculateEquivalentFocalLength(focalLength, sensorWidth, sensorHeight)
        
        // Should be around 24-26mm equivalent
        assertTrue(result > 24.0 && result < 26.0)
    }
}
