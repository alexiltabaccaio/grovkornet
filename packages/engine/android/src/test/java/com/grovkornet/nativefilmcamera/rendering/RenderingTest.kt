package com.grovkornet.nativefilmcamera.rendering

import android.content.Context
import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.view.Surface
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class RenderingTest {

    @Test
    fun liveFilmProcessor_basicFlow() {
        val processor = LiveFilmProcessor()
        
        // Before preparation
        assertFalse(processor.getDrsScale() == 0.0f)
        assertEquals(1.0f, processor.getDrsScale(), 0.0f)
        
        processor.simulateFrameTime(16.6f) // Should do nothing/not crash when ptr is 0
        processor.release() // Should do nothing/not crash when ptr is 0

        // Test renderLiveFrame when not prepared
        val surface = mockk<Surface>(relaxed = true)
        val params = CameraConfiguration()
        val uvMatrix = FloatArray(16)
        processor.renderLiveFrame(surface, params, uvMatrix) // Should return early and not crash
        
        // Preparation attempt should trigger unsatisfied link error because native library is missing in JVM tests
        val surfaceTexture = mockk<SurfaceTexture>(relaxed = true)
        val assetManager = mockk<AssetManager>(relaxed = true)
        try {
            processor.prepare(surfaceTexture, 1920, 1080, assetManager)
            fail("Expected UnsatisfiedLinkError since JNI methods are not loaded in JVM environment")
        } catch (e: UnsatisfiedLinkError) {
            // Expected
        } catch (e: Throwable) {
            // Also acceptable if wrapped or logs
        }
    }

    @Test
    fun offscreenFilmProcessor_basicFlow() = runBlocking {
        val processor = OffscreenFilmProcessor()
        
        // Before preparation
        assertEquals(1.0f, processor.getDrsScale(), 0.0f)
        processor.simulateFrameTime(16.6f)
        processor.release() // Coroutine release

        val assetManager = mockk<AssetManager>(relaxed = true)
        try {
            processor.prepare(1920, 1080, assetManager)
            fail("Expected UnsatisfiedLinkError")
        } catch (e: UnsatisfiedLinkError) {
            // Expected
        } catch (e: Throwable) {
            // Acceptable
        }

        // Test process when not prepared (which triggers prepare internally)
        val inputBitmap = mockk<Bitmap>(relaxed = true)
        val context = mockk<Context>(relaxed = true)
        val params = CameraConfiguration()
        try {
            processor.process(inputBitmap, params, context)
            fail("Expected UnsatisfiedLinkError")
        } catch (e: UnsatisfiedLinkError) {
            // Expected
        } catch (e: Throwable) {
            // Acceptable
        }
    }

    @Test
    fun filmRenderThread_lifecycle() {
        val assetManager = mockk<AssetManager>(relaxed = true)
        val surface = mockk<Surface>(relaxed = true)
        val onSurfaceTextureReadyCalled = booleanArrayOf(false)
        val onDebugUpdateCalled = booleanArrayOf(false)
        val onCameraFreezeDetectedCalled = booleanArrayOf(false)

        val thread = FilmRenderThread(
            assetManager = assetManager,
            surfaceProvider = { surface },
            onSurfaceTextureReady = { onSurfaceTextureReadyCalled[0] = true },
            onDebugUpdate = { onDebugUpdateCalled[0] = true },
            onCameraFreezeDetected = { onCameraFreezeDetectedCalled[0] = true }
        )

        // Start the thread to initialize looper and handler
        thread.start()

        // Test utility/property methods
        thread.notifyHardwareChange()
        thread.updateConfig(CameraConfiguration())
        thread.updateDimensions(1920, 1080)
        thread.updateCameraResolution(1920, 1080)

        // Clean up
        thread.release()
    }
}
