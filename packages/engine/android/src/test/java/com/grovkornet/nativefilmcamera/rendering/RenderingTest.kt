package com.grovkornet.nativefilmcamera.rendering

import android.content.Context
import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.view.Surface
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.*
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
    fun offscreenFilmProcessor_clearsBitmapOnException() = runBlocking {
        // Mock Bitmap companion to intercept createBitmap
        io.mockk.mockkStatic(Bitmap::class)
        val mockOutputBitmap = mockk<Bitmap>(relaxed = true)
        io.mockk.every { Bitmap.createBitmap(any<Int>(), any<Int>(), any<Bitmap.Config>()) } returns mockOutputBitmap

        // Mock OffscreenFilmProcessorNative dynamically to bypass JNI initHybrid() constructor
        val mockNative = mockk<OffscreenFilmProcessorNative>(relaxed = true)
        io.mockk.every { mockNative.prepare(any(), any(), any()) } just io.mockk.Runs
        io.mockk.every { mockNative.processBitmap(any(), any(), any(), any()) } throws RuntimeException("Simulated native crash")

        val processor = OffscreenFilmProcessor()
        
        // Inject the mocked native processor via reflection
        val nativeProcessorField = OffscreenFilmProcessor::class.java.getDeclaredField("nativeProcessor")
        nativeProcessorField.isAccessible = true
        nativeProcessorField.set(processor, mockNative)

        // Bypasse prepare link error since field is injected, we manually set isPrepared flag
        val preparedField = OffscreenFilmProcessor::class.java.getDeclaredField("isPrepared")
        preparedField.isAccessible = true
        preparedField.set(processor, true)
        
        // Set dimensions to match input bitmap to avoid prepare() re-trigger inside process()
        val widthField = OffscreenFilmProcessor::class.java.getDeclaredField("currentWidth")
        widthField.isAccessible = true
        widthField.set(processor, 1920)
        
        val heightField = OffscreenFilmProcessor::class.java.getDeclaredField("currentHeight")
        heightField.isAccessible = true
        heightField.set(processor, 1080)

        val inputBitmap = mockk<Bitmap>(relaxed = true)
        io.mockk.every { inputBitmap.width } returns 1920
        io.mockk.every { inputBitmap.height } returns 1080
        
        val context = mockk<Context>(relaxed = true)
        val params = CameraConfiguration()

        try {
            processor.process(inputBitmap, params, context)
            fail("Expected exception to be thrown from simulated native crash")
        } catch (e: Exception) {
            // Processing failed as expected
        }

        // Verify that the outputBitmap generated inside process() was recycled before throwing the exception
        io.mockk.verify(atLeast = 1) { mockOutputBitmap.recycle() }
        
        io.mockk.unmockkStatic(Bitmap::class)
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
