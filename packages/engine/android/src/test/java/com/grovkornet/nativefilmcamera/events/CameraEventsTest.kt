package com.grovkornet.nativefilmcamera.events

import org.junit.Test
import org.junit.Assert.*

class CameraEventsTest {

    @Test
    fun createOnDebugUpdate_createsCorrectMap() {
        val map = CameraEvents.createOnDebugUpdate(
            fps = 59.9,
            hwFps = 60.0,
            resolution = "1920x1080",
            timestamp = 123456.78
        )
        assertEquals(59.9, map["fps"])
        assertEquals(60.0, map["hwFps"])
        assertEquals("1920x1080", map["resolution"])
        assertEquals(123456.78, map["timestamp"])

        // Test nullable timestamp
        val mapNoTimestamp = CameraEvents.createOnDebugUpdate(
            fps = 30.0,
            hwFps = 30.0,
            resolution = "1280x720"
        )
        assertFalse(mapNoTimestamp.containsKey("timestamp"))
    }

    @Test
    fun createOnExposureUpdate_createsCorrectMap() {
        val map = CameraEvents.createOnExposureUpdate(
            iso = 400.0,
            shutterSpeed = 0.02,
            focusDistance = 1.5,
            activeCameraId = "camera_back",
            noiseReduction = 2.0
        )
        assertEquals(400.0, map["iso"])
        assertEquals(0.02, map["shutterSpeed"])
        assertEquals(1.5, map["focusDistance"])
        assertEquals("camera_back", map["activeCameraId"])
        assertEquals(2.0, map["noiseReduction"])

        // Test nullable arguments
        val mapMin = CameraEvents.createOnExposureUpdate(
            iso = 100.0,
            shutterSpeed = 0.01
        )
        assertFalse(mapMin.containsKey("focusDistance"))
        assertFalse(mapMin.containsKey("activeCameraId"))
        assertFalse(mapMin.containsKey("noiseReduction"))
    }

    @Test
    fun createOnCapabilitiesUpdateAvailableCamerasItem_createsCorrectMap() {
        val map = CameraEvents.createOnCapabilitiesUpdateAvailableCamerasItem(
            id = "0",
            focalLength = 4.25,
            focalLength35mm = 26.0
        )
        assertEquals("0", map["id"])
        assertEquals(4.25, map["focalLength"])
        assertEquals(26.0, map["focalLength35mm"])
    }

    @Test
    fun createOnCapabilitiesUpdate_createsCorrectMap() {
        val cameras = listOf(
            CameraEvents.createOnCapabilitiesUpdateAvailableCamerasItem("0", 4.25, 26.0)
        )
        val map = CameraEvents.createOnCapabilitiesUpdate(
            supportsFocus = true,
            isoMin = 50.0,
            isoMax = 3200.0,
            availableCameras = cameras
        )
        assertEquals(true, map["supportsFocus"])
        assertEquals(50.0, map["isoMin"])
        assertEquals(3200.0, map["isoMax"])
        assertEquals(cameras, map["availableCameras"])

        // Test nullable arguments
        val mapMin = CameraEvents.createOnCapabilitiesUpdate(
            supportsFocus = false,
            availableCameras = emptyList()
        )
        assertFalse(mapMin.containsKey("isoMin"))
        assertFalse(mapMin.containsKey("isoMax"))
    }

    @Test
    fun createOnPhotoCaptured_createsCorrectMap() {
        val map = CameraEvents.createOnPhotoCaptured("file:///test.jpg")
        assertEquals("file:///test.jpg", map["uri"])
    }

    @Test
    fun createOnTorchStateChanged_createsCorrectMap() {
        val map = CameraEvents.createOnTorchStateChanged(true)
        assertEquals(true, map["enabled"])
    }

    @Test
    fun createOnDeviceHealthUpdate_createsCorrectMap() {
        val map = CameraEvents.createOnDeviceHealthUpdate("critical", true)
        assertEquals("critical", map["thermalState"])
        assertEquals(true, map["isLowRam"])
    }
}
