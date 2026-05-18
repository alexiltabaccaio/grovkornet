package com.grovkornet.nativefilmcamera.ui

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLSurfaceView
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.rendering.FilmRenderer
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import expo.modules.kotlin.viewevent.EventDispatcher

class NativeFilmCameraView(context: Context) : GLSurfaceView(context) {

    val config = CameraConfiguration()
    private var renderer: FilmRenderer? = null
    private var cameraEngine: CameraEngine? = null

    private var updateScheduler: CameraUpdateScheduler? = null
    private var lastDebugTime = 0L

    // Event Dispatchers (Expo Modules API)
    val onDebugUpdate by EventDispatcher()
    val onExposureUpdate by EventDispatcher()
    val onCapabilitiesUpdate by EventDispatcher()
    val onPhotoCaptured by EventDispatcher()

    fun updateEffect(action: CameraConfiguration.() -> Unit) {
        config.action()
        renderer?.updateConfig(config)
    }

    fun updateHardware(action: CameraConfiguration.() -> Unit) {
        config.action()
        updateScheduler?.schedule()
    }

    fun updateBoth(action: CameraConfiguration.() -> Unit) {
        config.action()
        renderer?.updateConfig(config)
        updateScheduler?.schedule()
    }

    init {
        setEGLContextClientVersion(2)
        
        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {
                post { cameraEngine?.start(surfaceTexture) }
            }

            override fun onFpsUpdate(fps: Int, stampedFps: Int, resolution: String) {
                val now = System.currentTimeMillis()
                lastDebugTime = now
                // "fps" is what the user requested to see (stampedFps)
                // "hwFps" is the real rendering/hardware camera loop rate
                onDebugUpdate(mapOf("fps" to stampedFps, "resolution" to resolution, "hwFps" to fps))
            }

            override fun requestRender() {
                this@NativeFilmCameraView.requestRender()
            }
        }

        val cameraListener = object : CameraEngine.Listener {
            override fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int) {
                onExposureUpdate(mapOf(
                    "iso" to iso,
                    "shutterSpeed" to shutterSpeed,
                    "focusDistance" to focusDistance.toDouble(),
                    "noiseReduction" to noiseReduction
                ))
            }

            override fun onCapabilitiesUpdate(capabilities: WritableMap) {
                onCapabilitiesUpdate(capabilities.toHashMap())
            }

            override fun onCameraResolutionDetected(width: Int, height: Int) {
                renderer?.cameraWidth = width
                renderer?.cameraHeight = height
            }

            override fun onPhotoCaptured(uri: String) {
                onPhotoCaptured(mapOf("uri" to uri))
            }
        }

        renderer = FilmRenderer(config, rendererListener)
        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), config, cameraListener)
        updateScheduler = CameraUpdateScheduler(
            onUpdateCameraControls = {
                cameraEngine?.updateCameraControls()
            }
        )

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY

        renderer?.updateConfig(config)
    }


    fun takePhoto() {
        cameraEngine?.takePicture()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        updateEffect {
            viewportWidth = w.toFloat()
            viewportHeight = h.toFloat()
        }
    }

    fun release() {
        updateScheduler?.release()
        cameraEngine?.release()
        renderer?.release()
    }
}
