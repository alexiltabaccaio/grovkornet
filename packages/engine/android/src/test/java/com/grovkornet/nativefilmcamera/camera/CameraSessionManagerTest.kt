package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.graphics.SurfaceTexture
import android.hardware.SensorManager
import android.hardware.camera2.CameraManager
import android.view.OrientationEventListener
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.lifecycle.LifecycleOwner
import com.google.common.util.concurrent.ListenableFuture
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
class CameraSessionManagerTest {

    private lateinit var context: Context
    private lateinit var lifecycleOwner: LifecycleOwner
    private lateinit var listener: CameraSessionManager.Listener
    private lateinit var mockCamera: Camera
    private lateinit var mockProvider: ProcessCameraProvider
    private lateinit var mockFuture: ListenableFuture<ProcessCameraProvider>
    private lateinit var mockSurfaceTexture: SurfaceTexture
    private lateinit var cameraManager: CameraManager
    private lateinit var sensorManager: SensorManager

    @Before
    fun setUp() {
        context = mockk(relaxed = true)
        lifecycleOwner = mockk(relaxed = true)
        listener = mockk(relaxed = true)
        mockCamera = mockk(relaxed = true)
        mockProvider = mockk(relaxed = true)
        mockFuture = mockk(relaxed = true)
        mockSurfaceTexture = mockk(relaxed = true)
        cameraManager = mockk(relaxed = true)
        sensorManager = mockk(relaxed = true)

        every { context.getSystemService(Context.CAMERA_SERVICE) } returns cameraManager
        every { context.getSystemService(Context.SENSOR_SERVICE) } returns sensorManager
        every { cameraManager.cameraIdList } returns arrayOf("0")

        mockkObject(ProcessCameraProvider.Companion)
        every { ProcessCameraProvider.getInstance(context) } returns mockFuture

        val runnableSlot = slot<Runnable>()
        every { mockFuture.addListener(capture(runnableSlot), any()) } answers {
            runnableSlot.captured.run()
        }
        every { mockFuture.get() } returns mockProvider
        
        // Mock bindToLifecycle to return our mock camera
        every { mockProvider.bindToLifecycle(any(), any(), any(), any()) } returns mockCamera
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testStart_resolvesCameraProviderAndBindsUseCases() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true // selfie camera to bypass CameraManager complex query in tests
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        manager.start(mockSurfaceTexture)

        // Verify camera provider was queried and lifecycle binding was called
        verify { ProcessCameraProvider.getInstance(context) }
        verify { mockProvider.bindToLifecycle(lifecycleOwner, any(), any(), any()) }
        
        // Verify listener was notified
        verify { listener.onCameraReady(mockCamera, any()) }
    }

    @Test
    fun testSelfieCamera_selectsFrontCamera() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        manager.start(mockSurfaceTexture)

        // Capture the CameraSelector passed to bindToLifecycle
        val selectorSlot = slot<CameraSelector>()
        verify { mockProvider.bindToLifecycle(any(), capture(selectorSlot), any(), any()) }

        // CameraSelector front camera should have been bound
        val selector = selectorSlot.captured
        assertEquals(CameraSelector.LENS_FACING_FRONT, selector.lensFacing)
    }

    @Test
    fun testBackCamera_selectsBackCamera() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = false
            cameraId = "0"
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        manager.start(mockSurfaceTexture)

        val selectorSlot = slot<CameraSelector>()
        verify { mockProvider.bindToLifecycle(any(), capture(selectorSlot), any(), any()) }

        val selector = selectorSlot.captured
        // Since selectedSelector for back camera is customized via custom filters in calculateCameraSelector,
        // it won't have a simple lens facing constraint set.
        assertNull(selector.lensFacing)
    }

    @Test
    fun testRelease_unbindsCameraUseCases() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        manager.start(mockSurfaceTexture)
        manager.release()

        verify { mockProvider.unbindAll() }
    }

    @Test
    fun testForce60fpsCrop_forcesAspectRatio169() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
            resolutionSetting = 0 // isHighRes = true (<= 1)
            force60fpsCrop = true
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        val previewSlot = slot<Preview>()
        val imageCaptureSlot = slot<ImageCapture>()
        every { mockProvider.bindToLifecycle(any(), any(), capture(previewSlot), capture(imageCaptureSlot)) } returns mockCamera

        manager.start(mockSurfaceTexture)

        val preview = previewSlot.captured
        val imageCapture = imageCaptureSlot.captured

        val previewSelector = preview.resolutionSelector
        assertNotNull(previewSelector)
        assertEquals(androidx.camera.core.AspectRatio.RATIO_16_9, previewSelector?.aspectRatioStrategy?.preferredAspectRatio)

        val captureSelector = imageCapture.resolutionSelector
        assertNotNull(captureSelector)
        assertEquals(androidx.camera.core.AspectRatio.RATIO_16_9, captureSelector?.aspectRatioStrategy?.preferredAspectRatio)
    }

    @Test
    fun testHighResWithoutCrop_usesAspectRatio43() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
            resolutionSetting = 0 // isHighRes = true
            force60fpsCrop = false
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        val previewSlot = slot<Preview>()
        val imageCaptureSlot = slot<ImageCapture>()
        every { mockProvider.bindToLifecycle(any(), any(), capture(previewSlot), capture(imageCaptureSlot)) } returns mockCamera

        manager.start(mockSurfaceTexture)

        val preview = previewSlot.captured
        val previewSelector = preview.resolutionSelector
        assertNotNull(previewSelector)
        assertEquals(androidx.camera.core.AspectRatio.RATIO_4_3, previewSelector?.aspectRatioStrategy?.preferredAspectRatio)
    }

    @Test
    fun testPreviewQualityRisparmio_capsPreviewSize() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
            resolutionSetting = 0 // 4K targetSize
            force60fpsCrop = true // forces 16:9
            previewQuality = 2 // RISPARMIO (capping to 1280)
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        val previewSlot = slot<Preview>()
        every { mockProvider.bindToLifecycle(any(), any(), capture(previewSlot), any()) } returns mockCamera

        manager.start(mockSurfaceTexture)

        val preview = previewSlot.captured
        val previewSelector = preview.resolutionSelector
        assertNotNull(previewSelector)
        
        val strategy = previewSelector?.resolutionStrategy
        assertNotNull(strategy)
        assertEquals(android.util.Size(1280, 720), strategy?.boundSize)
        assertEquals(androidx.camera.core.resolutionselector.ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER, strategy?.fallbackRule)
    }

    @Test
    fun testOrientationChanged_updatesImageCaptureTargetRotation() {
        val config = CameraConfiguration().apply {
            isSelfieCamera = true
        }
        val manager = CameraSessionManager(context, lifecycleOwner, config, listener)

        val imageCaptureSlot = slot<ImageCapture>()
        every { mockProvider.bindToLifecycle(any(), any(), any(), capture(imageCaptureSlot)) } returns mockCamera

        manager.start(mockSurfaceTexture)

        // Retrieve the anonymous OrientationEventListener via getter method reflection
        val method = CameraSessionManager::class.java.getDeclaredMethod("getOrientationEventListener")
        method.isAccessible = true
        val orientationListener = method.invoke(manager) as OrientationEventListener

        val imageCapture = imageCaptureSlot.captured

        // Test 90 degrees -> ROTATION_270
        orientationListener.onOrientationChanged(90)
        assertEquals(android.view.Surface.ROTATION_270, imageCapture.targetRotation)

        // Test 270 degrees -> ROTATION_90
        orientationListener.onOrientationChanged(270)
        assertEquals(android.view.Surface.ROTATION_90, imageCapture.targetRotation)

        // Test 180 degrees -> ROTATION_180
        orientationListener.onOrientationChanged(180)
        assertEquals(android.view.Surface.ROTATION_180, imageCapture.targetRotation)

        // Test 0 degrees -> ROTATION_0
        orientationListener.onOrientationChanged(0)
        assertEquals(android.view.Surface.ROTATION_0, imageCapture.targetRotation)
    }
}
