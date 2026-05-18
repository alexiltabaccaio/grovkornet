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
import expo.modules.kotlin.viewevent.EventDispatcher

class NativeFilmCameraView(context: Context) : GLSurfaceView(context) {

    private var renderer: FilmRenderer? = null
    private var cameraEngine: CameraEngine? = null

    private var updateScheduler: CameraUpdateScheduler? = null
    private var propSynchronizer: CameraPropSynchronizer? = null
    private var lastDebugTime = 0L

    // Event Dispatchers (Expo Modules API)
    val onDebugUpdate by EventDispatcher()
    val onExposureUpdate by EventDispatcher()
    val onCapabilitiesUpdate by EventDispatcher()
    val onPhotoCaptured by EventDispatcher()

    // Props
    var saturation: Float = 1.0f
        set(value) { field = value; propSynchronizer?.saturation = value }
    var contrast: Float = 1.0f
        set(value) { field = value; propSynchronizer?.contrast = value }
    var grainIntensity: Float = 0.0f
        set(value) { field = value; propSynchronizer?.grainIntensity = value }
    var grainChroma: Float = 0.0f
        set(value) { field = value; propSynchronizer?.grainChroma = value }
    var grainSize: Float = 1.0f
        set(value) { field = value; propSynchronizer?.grainSize = value }
    var grainEnabled: Boolean = true
        set(value) { field = value; propSynchronizer?.grainEnabled = value }
    var aberration: Float = 0.0f
        set(value) { field = value; propSynchronizer?.aberration = value }
    var aberrationDirection: Int = 0
        set(value) { field = value; propSynchronizer?.aberrationDirection = value }
    var ev: Float = 0.0f
        set(value) { field = value; propSynchronizer?.ev = value }
    var whiteBalance: Float = 5000.0f
        set(value) { field = value; propSynchronizer?.whiteBalance = value }
    var tint: Float = 0.0f
        set(value) { field = value; propSynchronizer?.tint = value }
    var noiseReduction: Int = 1
        set(value) { field = value; propSynchronizer?.noiseReduction = value }
    var sharpening: Float = 0.0f
        set(value) { field = value; propSynchronizer?.sharpening = value }

    // Hardware Props
    var isoAuto: Boolean = true
        set(value) { field = value; propSynchronizer?.isoAuto = value }
    var shutterSpeedAuto: Boolean = true
        set(value) { field = value; propSynchronizer?.shutterSpeedAuto = value }
    var whiteBalanceAuto: Boolean = true
        set(value) { field = value; propSynchronizer?.whiteBalanceAuto = value }
    var autoFocus: Boolean = false
        set(value) { field = value; propSynchronizer?.autoFocus = value }
    var iso: Int = 400
        set(value) { field = value; propSynchronizer?.iso = value }
    var exposureTime: Long = 1000000000L / 60
        set(value) { field = value; propSynchronizer?.exposureTime = value }
    var focusDistance: Float = 0.0f
        set(value) { field = value; propSynchronizer?.focusDistance = value }
    
    var torchState: Float = 0.0f
        set(value) { field = value; propSynchronizer?.torchState = value }
    var torchStrength: Int = 1
        set(value) { field = value; propSynchronizer?.torchStrength = value }
    var cameraId: String? = null
        set(value) { field = value; propSynchronizer?.cameraId = value }
    var aspectRatio: Int = 1
        set(value) { 
            if (field != value) {
                field = value
                propSynchronizer?.aspectRatio = value
            }
        }
    var targetFps: Int = 60
        set(value) { field = value; propSynchronizer?.targetFps = value }

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

        renderer = FilmRenderer(rendererListener)
        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), cameraListener)
        updateScheduler = CameraUpdateScheduler(
            onUpdateCameraControls = {
                cameraEngine?.updateCameraControls()
            }
        )
        propSynchronizer = CameraPropSynchronizer(cameraEngine!!.config, renderer!!, updateScheduler!!)

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY

        // Initialize engine config with current view props
        propSynchronizer?.syncConfig()
    }


    fun takePhoto() {
        cameraEngine?.takePicture()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        cameraEngine?.config?.viewportWidth = w.toFloat()
        cameraEngine?.config?.viewportHeight = h.toFloat()
    }

    fun release() {
        updateScheduler?.release()
        cameraEngine?.release()
        renderer?.release()
    }
}
