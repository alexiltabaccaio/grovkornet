package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.graphics.SurfaceTexture
import androidx.camera.core.Camera
import androidx.camera.core.ImageCapture
import androidx.lifecycle.LifecycleOwner
import com.grovkornet.nativefilmcamera.capture.CapturePipeline
import com.grovkornet.nativefilmcamera.managers.HardwareCapabilitiesManager
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class CameraEngineTest {

    private lateinit var mockContext: Context
    private lateinit var mockLifecycleOwner: LifecycleOwner
    private lateinit var mockListener: CameraEngine.Listener
    private lateinit var mockCamera: Camera
    private lateinit var mockImageCapture: ImageCapture
    private lateinit var mockSurfaceTexture: SurfaceTexture

    @Before
    fun setUp() {
        mockContext = mockk<Context>(relaxed = true)
        mockLifecycleOwner = mockk<LifecycleOwner>(relaxed = true)
        mockListener = mockk<CameraEngine.Listener>(relaxed = true)
        mockCamera = mockk<Camera>(relaxed = true)
        mockImageCapture = mockk<ImageCapture>(relaxed = true)
        mockSurfaceTexture = mockk<SurfaceTexture>(relaxed = true)

        mockkConstructor(CameraSessionManager::class)
        mockkConstructor(CameraControlManager::class)
        mockkConstructor(CapturePipeline::class)
        mockkConstructor(HardwareCapabilitiesManager::class)

        mockkStatic(Arguments::class)
        every { Arguments.createMap() } returns mockk<WritableMap>(relaxed = true)

        // Stub methods on constructed mocks to avoid null pointer or un-stubbed exceptions
        every { anyConstructed<CameraSessionManager>().start(any(), any()) } just Runs
        every { anyConstructed<CameraSessionManager>().bindCameraUseCases(any(), any()) } just Runs
        every { anyConstructed<CameraSessionManager>().release() } just Runs
        every { anyConstructed<CameraSessionManager>().currentBaseZoom } returns 1.0f

        every { anyConstructed<CameraControlManager>().createCaptureCallback() } returns mockk(relaxed = true)
        every { anyConstructed<CameraControlManager>().updateControls(any(), any()) } just Runs

        every { anyConstructed<CapturePipeline>().takePicture(any()) } just Runs
        every { anyConstructed<CapturePipeline>().hasActiveCaptures() } returns false
        every { anyConstructed<CapturePipeline>().release() } just Runs

        every { anyConstructed<HardwareCapabilitiesManager>().populateCapabilities(any(), any()) } just Runs
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testStart_delegatesToSessionManager() {
        val config = CameraConfiguration()
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        engine.start(mockSurfaceTexture)

        verify { anyConstructed<CameraSessionManager>().start(mockSurfaceTexture, any()) }
    }

    @Test
    fun testOnCameraReady_updatesActiveStatesAndEmitsCapabilities() {
        val config = CameraConfiguration()
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        // Simulate callback from session manager
        engine.onCameraReady(mockCamera, mockImageCapture)

        // Verify hardware capabilities are requested and populated
        verify { anyConstructed<HardwareCapabilitiesManager>().populateCapabilities(any(), mockCamera) }
        // Verify listener is called
        verify { mockListener.onCapabilitiesUpdate(any()) }
    }

    @Test
    fun testUpdateCameraControls_callsUpdateControlsOnNoConfigChange() {
        val config = CameraConfiguration().apply {
            cameraId = "camera_0"
            zoom = 1.2f
        }
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        // Setup active camera
        engine.onCameraReady(mockCamera, mockImageCapture)
        
        // Setup engine bound properties cache by starting or setting up boundary values
        engine.start(mockSurfaceTexture)

        // Trigger updateControls
        engine.updateCameraControls()

        // Verify updateControls was called on control manager since boundary values didn't change
        verify { anyConstructed<CameraControlManager>().updateControls(mockCamera, 1.0f) }
    }

    @Test
    fun testUpdateCameraControls_rebindsUseCasesOnConfigChange() {
        val config = CameraConfiguration().apply {
            cameraId = "camera_0"
        }
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        // Initialize states
        engine.start(mockSurfaceTexture)

        // Now modify config to simulate user changing camera configuration (e.g. resolution)
        config.resolutionSetting = 3

        engine.updateCameraControls()

        // Verify that bindCameraUseCases is called again due to resolution boundary change
        verify { anyConstructed<CameraSessionManager>().bindCameraUseCases(mockSurfaceTexture, any()) }
    }

    @Test
    fun testTakePicture_delegatesToCapturePipeline() {
        val config = CameraConfiguration()
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        // Set active image capture
        engine.onCameraReady(mockCamera, mockImageCapture)

        engine.takePicture()

        verify { anyConstructed<CapturePipeline>().takePicture(mockImageCapture) }
    }

    @Test
    fun testRelease_releasesManagers() {
        val config = CameraConfiguration()
        val engine = CameraEngine(mockContext, mockLifecycleOwner, config, mockListener)

        engine.release()

        verify { anyConstructed<CameraSessionManager>().release() }
        verify { anyConstructed<CapturePipeline>().release() }
    }
}
