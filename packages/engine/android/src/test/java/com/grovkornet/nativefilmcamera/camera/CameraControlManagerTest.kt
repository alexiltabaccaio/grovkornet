package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.util.Range
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.core.Camera
import androidx.camera.core.CameraControl
import androidx.camera.core.CameraInfo
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)
class CameraControlManagerTest {

    private lateinit var context: Context
    private lateinit var mockCamera: Camera
    private lateinit var mockCameraControl: CameraControl
    private lateinit var mockCameraInfo: CameraInfo
    
    private lateinit var mockCamera2Control: Camera2CameraControl
    private lateinit var mockCamera2Info: Camera2CameraInfo

    @Before
    fun setUp() {
        context = mockk<Context>(relaxed = true)
        
        mockCamera = mockk<Camera>(relaxed = true)
        mockCameraControl = mockk<androidx.camera.core.impl.CameraControlInternal>(relaxed = true)
        mockCameraInfo = mockk<androidx.camera.core.impl.CameraInfoInternal>(relaxed = true)
        
        mockCamera2Control = mockk<Camera2CameraControl>(relaxed = true)
        mockCamera2Info = mockk<Camera2CameraInfo>(relaxed = true)

        val mockCameraInfoImpl = mockk<androidx.camera.camera2.internal.Camera2CameraInfoImpl>(relaxed = true)
        val mockCameraControlImpl = mockk<androidx.camera.camera2.internal.Camera2CameraControlImpl>(relaxed = true)

        every { mockCamera.cameraControl } returns mockCameraControl
        every { mockCamera.cameraInfo } returns mockCameraInfo
        
        // Mock flash unit check to true by default to test basic torch/exposure configurations cleanly
        every { mockCameraInfo.hasFlashUnit() } returns true

        every { (mockCameraInfo as androidx.camera.core.impl.CameraInfoInternal).getImplementation() } returns mockCameraInfoImpl
        every { mockCameraInfoImpl.getCamera2CameraInfo() } returns mockCamera2Info

        every { (mockCameraControl as androidx.camera.core.impl.CameraControlInternal).getImplementation() } returns mockCameraControlImpl
        every { mockCameraControlImpl.getCamera2CameraControl() } returns mockCamera2Control

        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES) } returns null
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE) } returns Range(100, 6400)
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testUpdateControls_appliesZoom() {
        val config = CameraConfiguration().apply {
            zoom = 2.0f
        }
        val listener = mockk<CameraControlManager.Listener>(relaxed = true)
        val manager = CameraControlManager(context, config, listener)

        // Run method under test
        manager.updateControls(mockCamera, baseZoom = 1.5f)

        // Verify cameraControl.setZoomRatio is called with baseZoom * config.zoom (1.5 * 2.0 = 3.0f)
        verify { mockCameraControl.setZoomRatio(3.0f) }
    }

    @Test
    fun testUpdateControls_selectsBestFpsRange() {
        val config = CameraConfiguration().apply {
            targetFps = 60
        }
        val listener = mockk<CameraControlManager.Listener>(relaxed = true)
        val manager = CameraControlManager(context, config, listener)

        // Set up mock available FPS ranges
        val fpsRanges = arrayOf(
            Range(15, 30),
            Range(30, 30),
            Range(30, 60),
            Range(60, 60)
        )
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES) } returns fpsRanges

        // Run
        manager.updateControls(mockCamera)

        // Verify that Camera2CameraControl was used to build and apply capture request options
        verify { mockCamera2Control.captureRequestOptions = any() }
    }

    @Test
    fun testUpdateControls_configuresManualExposure() {
        val config = CameraConfiguration().apply {
            isoAuto = false
            iso = 200
            shutterSpeedAuto = false
            exposureTime = 16666666L // 1/60th of a second in nanoseconds
        }
        val listener = mockk<CameraControlManager.Listener>(relaxed = true)
        val manager = CameraControlManager(context, config, listener)

        // Run
        manager.updateControls(mockCamera)

        // Verify captureRequestOptions was assigned
        verify { mockCamera2Control.captureRequestOptions = any() }
    }
}
