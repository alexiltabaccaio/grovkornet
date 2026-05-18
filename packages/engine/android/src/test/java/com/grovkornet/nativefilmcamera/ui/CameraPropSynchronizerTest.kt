package com.grovkornet.nativefilmcamera.ui

import android.graphics.SurfaceTexture
import com.grovkornet.nativefilmcamera.rendering.FilmRenderer
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import org.junit.Test
import org.junit.Assert.*

class CameraPropSynchronizerTest {

    @Test
    fun settingProperties_updatesConfigAndRendererAndSchedules() {
        val config = CameraConfiguration()
        var scheduleCalled = false

        val scheduler = CameraUpdateScheduler(
            onUpdateCameraControls = { scheduleCalled = true },
            postDelayedAction = { _, _ -> },
            removeCallbacksAction = { },
            currentTimeProvider = { 1000L }
        )

        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {}
            override fun onFpsUpdate(fps: Int, stampedFps: Int, resolution: String) {}
            override fun requestRender() {}
        }

        val renderer = FilmRenderer(rendererListener)
        val synchronizer = CameraPropSynchronizer(config, renderer, scheduler)

        // Test non-hardware prop
        synchronizer.saturation = 2.5f
        assertEquals(2.5f, config.saturation, 0.01f)
        assertEquals(2.5f, renderer.saturation, 0.01f)

        // Test hardware prop that triggers schedule
        synchronizer.ev = 1.5f
        assertEquals(1.5f, config.ev, 0.01f)
        assertEquals(1.5f, renderer.ev, 0.01f)
        assertTrue("Setting EV should trigger scheduler", scheduleCalled)
    }

    @Test
    fun syncConfig_populatesConfigAndRenderer() {
        val config = CameraConfiguration()
        val scheduler = CameraUpdateScheduler(
            onUpdateCameraControls = { },
            postDelayedAction = { _, _ -> },
            removeCallbacksAction = { },
            currentTimeProvider = { 1000L }
        )

        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {}
            override fun onFpsUpdate(fps: Int, stampedFps: Int, resolution: String) {}
            override fun requestRender() {}
        }

        val renderer = FilmRenderer(rendererListener)
        val synchronizer = CameraPropSynchronizer(config, renderer, scheduler)

        synchronizer.contrast = 1.8f
        synchronizer.isoAuto = false
        synchronizer.iso = 800

        synchronizer.syncConfig()

        assertEquals(1.8f, config.contrast, 0.01f)
        assertEquals(false, config.isoAuto)
        assertEquals(800, config.iso)
    }
}
