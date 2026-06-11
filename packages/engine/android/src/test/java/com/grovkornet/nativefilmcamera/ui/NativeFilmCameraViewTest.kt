package com.grovkornet.nativefilmcamera.ui

import android.content.Context
import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.SurfaceHolder
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.capture.ThumbnailCaptureService
import com.grovkornet.nativefilmcamera.managers.CameraTorchManager
import com.grovkornet.nativefilmcamera.rendering.FilmRenderThread
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class NativeFilmCameraViewTest {

    private lateinit var context: Context
    private lateinit var mockOnDebugUpdate: expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>
    private lateinit var mockOnExposureUpdate: expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>
    private lateinit var mockOnCapabilitiesUpdate: expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>
    private lateinit var mockOnPhotoCaptured: expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>
    private lateinit var mockOnTorchStateChanged: expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>

    private val torchCallbackSlot = slot<(Boolean) -> Unit>()
    private val thumbnailSlot = slot<(String) -> Unit>()

    @Before
    fun setUp() {
        context = org.robolectric.RuntimeEnvironment.getApplication()
        
        // Mock event dispatchers delegates using ViewEventDelegate
        mockkConstructor(expo.modules.kotlin.viewevent.ViewEventDelegate::class)
        mockOnDebugUpdate = mockk<expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>>(relaxed = true)
        mockOnExposureUpdate = mockk<expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>>(relaxed = true)
        mockOnCapabilitiesUpdate = mockk<expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>>(relaxed = true)
        mockOnPhotoCaptured = mockk<expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>>(relaxed = true)
        mockOnTorchStateChanged = mockk<expo.modules.kotlin.viewevent.ViewEventCallback<Map<String, Any>>>(relaxed = true)

        val answerBlock: io.mockk.MockKAnswerScope<expo.modules.kotlin.viewevent.ViewEventCallback<*>, *>.(io.mockk.Call) -> expo.modules.kotlin.viewevent.ViewEventCallback<*> = {
            val property = args.firstOrNull { it is kotlin.reflect.KProperty<*> } as? kotlin.reflect.KProperty<*>
            val propertyName = property?.name
            when (propertyName) {
                "onDebugUpdate" -> mockOnDebugUpdate
                "onExposureUpdate" -> mockOnExposureUpdate
                "onCapabilitiesUpdate" -> mockOnCapabilitiesUpdate
                "onPhotoCaptured" -> mockOnPhotoCaptured
                "onTorchStateChanged" -> mockOnTorchStateChanged
                else -> mockk(relaxed = true)
            }
        }

        every { 
            anyConstructed<expo.modules.kotlin.viewevent.ViewEventDelegate<*>>().getValue(any()) 
        } answers answerBlock

        every { 
            anyConstructed<expo.modules.kotlin.viewevent.ViewEventDelegate<*>>().getValue(any(), any()) 
        } answers answerBlock

        // Mock camera components
        mockkConstructor(CameraEngine::class)
        every { anyConstructed<CameraEngine>().start(any()) } just Runs
        every { anyConstructed<CameraEngine>().updateCameraControls() } just Runs
        every { anyConstructed<CameraEngine>().takePicture() } just Runs
        every { anyConstructed<CameraEngine>().release() } just Runs
        every { anyConstructed<CameraEngine>().recoverFromFreeze() } just Runs

        // Mock scheduler
        mockkConstructor(CameraUpdateScheduler::class)
        every { anyConstructed<CameraUpdateScheduler>().schedule() } just Runs
        every { anyConstructed<CameraUpdateScheduler>().release() } just Runs

        // Mock Torch Companion
        mockkObject(CameraTorchManager.Companion)
        val mockTorchManager = mockk<CameraTorchManager>(relaxed = true)
        every {
            CameraTorchManager.Companion.create(
                any(), any(), any(), capture(torchCallbackSlot)
            )
        } returns mockTorchManager

        // Mock Thumbnail Capture Service
        mockkObject(ThumbnailCaptureService)
        every {
            ThumbnailCaptureService.captureThumbnail(
                any(), any(), any(), capture(thumbnailSlot), any()
            )
        } just Runs

        // Mock FilmRenderThread
        mockkConstructor(FilmRenderThread::class)
        every { anyConstructed<FilmRenderThread>().start() } just Runs
        every { anyConstructed<FilmRenderThread>().updateConfig(any()) } just Runs
        every { anyConstructed<FilmRenderThread>().updateDimensions(any(), any()) } just Runs
        every { anyConstructed<FilmRenderThread>().notifyHardwareChange() } just Runs
        every { anyConstructed<FilmRenderThread>().updateCameraResolution(any(), any()) } just Runs
        every { anyConstructed<FilmRenderThread>().release() } just Runs
        every { anyConstructed<FilmRenderThread>().getLooper() } returns android.os.Looper.getMainLooper()
        every { anyConstructed<FilmRenderThread>().looper } returns android.os.Looper.getMainLooper()
    }

    @After
    fun tearDown() {
        unmockkAll()
        try {
            val activeInstancesField = NativeFilmCameraView::class.java.getDeclaredField("activeInstances")
            activeInstancesField.isAccessible = true
            val activeInstances = activeInstancesField.get(null) as java.util.concurrent.CopyOnWriteArraySet<*>
            activeInstances.clear()
        } catch (e: Exception) {
            try {
                val companionField = NativeFilmCameraView.Companion::class.java.getDeclaredField("activeInstances")
                companionField.isAccessible = true
                val activeInstances = companionField.get(NativeFilmCameraView.Companion) as java.util.concurrent.CopyOnWriteArraySet<*>
                activeInstances.clear()
            } catch (ex: Exception) {
                ex.printStackTrace()
            }
        }
    }

    @Test
    fun testInitializationAndLifecycle() {
        val view = NativeFilmCameraView(context)
        assertNotNull(view.config)

        // Mock holder
        val mockHolder = mockk<SurfaceHolder>(relaxed = true)
        val mockSurface = mockk<Surface>(relaxed = true)
        every { mockHolder.surface } returns mockSurface

        // Trigger surfaceCreated
        view.surfaceCreated(mockHolder)

        // Verify FilmRenderThread is initialized and started
        val renderThreadField = NativeFilmCameraView::class.java.getDeclaredField("renderThread")
        renderThreadField.isAccessible = true
        val renderThreadInstance = renderThreadField.get(view) as FilmRenderThread
        assertNotNull(renderThreadInstance)
        verify { renderThreadInstance.updateConfig(any()) }
        verify { renderThreadInstance.start() }
        verify { renderThreadInstance.updateDimensions(0, 0) }

        // Trigger onSurfaceTextureReady callback
        val onSurfaceTextureReadyField = FilmRenderThread::class.java.getDeclaredField("onSurfaceTextureReady")
        onSurfaceTextureReadyField.isAccessible = true
        val onSurfaceTextureReady = onSurfaceTextureReadyField.get(renderThreadInstance) as (SurfaceTexture) -> Unit
        val mockSurfaceTexture = mockk<SurfaceTexture>()
        onSurfaceTextureReady(mockSurfaceTexture)
        verify { anyConstructed<CameraEngine>().start(mockSurfaceTexture) }

        // Trigger onDebugUpdate callback
        val onDebugUpdateField = FilmRenderThread::class.java.getDeclaredField("onDebugUpdate")
        onDebugUpdateField.isAccessible = true
        val onDebugUpdate = onDebugUpdateField.get(renderThreadInstance) as (Map<String, Any>) -> Unit
        val debugMap = mapOf<String, Any>("fps" to 30.0)
        onDebugUpdate(debugMap)
        verify { mockOnDebugUpdate.invoke(debugMap) }

        // Trigger onCameraFreezeDetected callback
        val onCameraFreezeDetectedField = FilmRenderThread::class.java.getDeclaredField("onCameraFreezeDetected")
        onCameraFreezeDetectedField.isAccessible = true
        val onCameraFreezeDetected = onCameraFreezeDetectedField.get(renderThreadInstance) as () -> Unit
        onCameraFreezeDetected()
        verify { anyConstructed<CameraEngine>().recoverFromFreeze() }

        // Trigger surfaceChanged
        view.surfaceChanged(mockHolder, 0, 1080, 1920)
        verify { renderThreadInstance.updateDimensions(1080, 1920) }

        // Trigger surfaceDestroyed
        view.surfaceDestroyed(mockHolder)
        verify { renderThreadInstance.release() }
        assertNull(renderThreadField.get(view))
    }

    @Test
    fun testUpdateFunctions() {
        val view = NativeFilmCameraView(context)

        // Mock holder and create surface
        val mockHolder = mockk<SurfaceHolder>(relaxed = true)
        view.surfaceCreated(mockHolder)

        // 1. updateEffect
        view.updateEffect {
            saturation = 1.5f
        }
        assertEquals(1.5f, view.config.saturation, 0.0f)

        // 2. updateHardware (no resolution change path)
        view.updateHardware {
            zoom = 2.0f
        }
        assertEquals(2.0f, view.config.zoom, 0.0f)

        // 3. updateHardware (with resolution change path to cover dirty logic)
        view.updateHardware {
            cameraId = "camera_1"
        }
        assertEquals("camera_1", view.config.cameraId)
        // Verify renderThread.notifyHardwareChange is called
        val renderThreadField = NativeFilmCameraView::class.java.getDeclaredField("renderThread")
        renderThreadField.isAccessible = true
        val renderThreadInstance = renderThreadField.get(view) as FilmRenderThread
        verify { renderThreadInstance.notifyHardwareChange() }

        // 4. updateBoth
        view.updateBoth {
            resolutionSetting = 2
        }
        assertEquals(2, view.config.resolutionSetting)

        // Verify scheduler schedule was called
        verify(exactly = 3) { anyConstructed<CameraUpdateScheduler>().schedule() }
    }

    @Test
    fun testCameraListenerDelegation() {
        val view = NativeFilmCameraView(context)

        // Extract listener
        val cameraEngineField = NativeFilmCameraView::class.java.getDeclaredField("cameraEngine")
        cameraEngineField.isAccessible = true
        val cameraEngineInstance = cameraEngineField.get(view) as CameraEngine

        val listenerField = CameraEngine::class.java.getDeclaredField("listener")
        listenerField.isAccessible = true
        val cameraListener = listenerField.get(cameraEngineInstance) as CameraEngine.Listener

        // 1. onExposureUpdate
        cameraListener.onExposureUpdate(200, 0.02, 1.2f, 2, "cam_back")
        verify { 
            mockOnExposureUpdate(mapOf(
                "iso" to 200,
                "shutterSpeed" to 0.02,
                "focusDistance" to 1.2f.toDouble(),
                "noiseReduction" to 2,
                "activeCameraId" to "cam_back"
            )) 
        }

        // 2. onCapabilitiesUpdate
        val mockWritableMap = mockk<WritableMap>()
        every { mockWritableMap.toHashMap() } returns hashMapOf<String, Any?>("cap" to "val", "nullKey" to null)
        cameraListener.onCapabilitiesUpdate(mockWritableMap)
        verify {
            mockOnCapabilitiesUpdate(mapOf("cap" to "val"))
        }

        // 3. onCameraResolutionDetected
        val mockHolder = mockk<SurfaceHolder>(relaxed = true)
        view.surfaceCreated(mockHolder)
        val renderThreadField = NativeFilmCameraView::class.java.getDeclaredField("renderThread")
        renderThreadField.isAccessible = true
        val renderThreadInstance = renderThreadField.get(view) as FilmRenderThread

        cameraListener.onCameraResolutionDetected(1280, 720)
        assertEquals(1280, view.cameraWidth)
        assertEquals(720, view.cameraHeight)
        verify { renderThreadInstance.updateCameraResolution(1280, 720) }
        verify { mockOnDebugUpdate(mapOf("resolution" to "1280x720")) }

        // 4. onPhotoCaptured
        cameraListener.onPhotoCaptured("file:///image.jpg")
        verify { mockOnPhotoCaptured(mapOf("uri" to "file:///image.jpg")) }
    }

    @Test
    fun testTakePhotoAndScheduler() {
        val view = NativeFilmCameraView(context)
        
        // 1. takePhoto
        view.takePhoto()
        verify { anyConstructed<CameraEngine>().takePicture() }

        // Trigger thumbnail captured callback
        assertTrue(thumbnailSlot.isCaptured)
        thumbnailSlot.captured("file:///thumb.png")
        verify { mockOnPhotoCaptured(mapOf("uri" to "file:///thumb.png")) }

        // 2. scheduler execution
        val schedulerField = NativeFilmCameraView::class.java.getDeclaredField("updateScheduler")
        schedulerField.isAccessible = true
        val schedulerInstance = schedulerField.get(view) as CameraUpdateScheduler

        val onUpdateField = CameraUpdateScheduler::class.java.getDeclaredField("onUpdateCameraControls")
        onUpdateField.isAccessible = true
        val onUpdateCameraControls = onUpdateField.get(schedulerInstance) as () -> Unit

        onUpdateCameraControls()
        verify { anyConstructed<CameraEngine>().updateCameraControls() }
    }

    @Test
    fun testTorchAndRelease() {
        val view = NativeFilmCameraView(context)

        // 1. setSecureMode
        // Test non-debuggable Context (production / release)
        context.applicationInfo.flags = 0
        view.setSecureMode(false) // should force secure = true in production

        // Test debugable Context
        context.applicationInfo.flags = android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE
        view.setSecureMode(true)
        view.setSecureMode(false)

        // 2. Torch state changed callback (normal path)
        assertTrue(torchCallbackSlot.isCaptured)
        val onTorchStateChangedCallback = torchCallbackSlot.captured
        onTorchStateChangedCallback(true)
        assertTrue(view.config.torchEnabled)
        verify { mockOnTorchStateChanged(mapOf("enabled" to true)) }

        // Trigger callback during reconfiguration window (< 2 seconds)
        // Set lastReconfigureTime reflectively
        val lastReconfigureTimeField = NativeFilmCameraView::class.java.getDeclaredField("lastReconfigureTime")
        lastReconfigureTimeField.isAccessible = true
        lastReconfigureTimeField.set(view, System.currentTimeMillis())

        onTorchStateChangedCallback(false)
        // should be ignored: config.torchEnabled remains true
        assertTrue(view.config.torchEnabled)

        // 3. Companion methods
        val config1 = NativeFilmCameraView.getFirstValidConfig()
        assertNotNull(config1)

        NativeFilmCameraView.dispatchUpdate {
            zoom = 4.0f
        }
        assertEquals(4.0f, view.config.zoom, 0.0f)

        // 4. Release
        view.release()
        val mockTorchManager = CameraTorchManager.Companion.create(mockk(), mockk(), mockk(), mockk())
        verify { mockTorchManager.unregister() }
        verify { anyConstructed<CameraUpdateScheduler>().release() }
        verify { anyConstructed<CameraEngine>().release() }
        verify { mockTorchManager.restoreTorchIfLogicalEnabled() }

        // Config should not return since isReleased is true
        assertNull(NativeFilmCameraView.getFirstValidConfig())
    }
}
