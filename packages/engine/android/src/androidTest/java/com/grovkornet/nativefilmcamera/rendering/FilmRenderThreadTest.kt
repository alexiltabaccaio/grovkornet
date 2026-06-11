package com.grovkornet.nativefilmcamera.rendering

import android.content.res.AssetManager
import android.graphics.SurfaceTexture
import android.view.Surface
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class FilmRenderThreadTest {

    @Test
    fun testThreadLifecycleAndRendering() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val assetManager = context.assets

        val surfaceTextureOutput = SurfaceTexture(10)
        surfaceTextureOutput.setDefaultBufferSize(128, 128)
        val outputSurface = Surface(surfaceTextureOutput)

        val surfaceTextureReadyLatch = CountDownLatch(1)
        var stResult: SurfaceTexture? = null
        val debugLatch = CountDownLatch(1)
        val freezeLatch = CountDownLatch(1)

        val thread = FilmRenderThread(
            assetManager = assetManager,
            surfaceProvider = { outputSurface },
            onSurfaceTextureReady = { st ->
                stResult = st
                surfaceTextureReadyLatch.countDown()
            },
            onDebugUpdate = {
                debugLatch.countDown()
            },
            onCameraFreezeDetected = {
                freezeLatch.countDown()
            }
        )

        // 1. Start Thread
        thread.start()

        // 2. Update Dimensions to trigger setupProcessorIfNeeded
        thread.updateDimensions(128, 128)
        
        // Wait for SurfaceTexture to be ready
        val stReady = surfaceTextureReadyLatch.await(5, TimeUnit.SECONDS)
        assertTrue("SurfaceTexture should be created and callback invoked", stReady)
        assertNotNull("SurfaceTexture should not be null", stResult)

        // Update camera resolution and configuration
        thread.updateCameraResolution(1920, 1080)
        thread.updateConfig(CameraConfiguration(saturation = 1.2f))

        // Notify hardware change
        thread.notifyHardwareChange()

        // 3. Let's wait a moment to see if the watchdog or frames run
        delay(100)

        // Wait for camera freeze detection (watchdog) because no real frames are coming in
        val freezeDetected = freezeLatch.await(4, TimeUnit.SECONDS)
        assertTrue("Watchdog should detect camera freeze when no frames arrive", freezeDetected)

        // 5. Clean up
        thread.release()
        outputSurface.release()
        surfaceTextureOutput.release()
    }
}
