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

    private lateinit var renderer: FilmRenderer
    private lateinit var cameraEngine: CameraEngine

    private lateinit var updateScheduler: CameraUpdateScheduler
    private lateinit var propSynchronizer: CameraPropSynchronizer
    private var lastDebugTime = 0L

    // Event Dispatchers (Expo Modules API)
    val onDebugUpdate by EventDispatcher()
    val onExposureUpdate by EventDispatcher()
    val onCapabilitiesUpdate by EventDispatcher()
    val onPhotoCaptured by EventDispatcher()

    // Props
    var saturation: Float = 1.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.saturation = value }
    var contrast: Float = 1.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.contrast = value }
    var grainIntensity: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.grainIntensity = value }
    var grainChroma: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.grainChroma = value }
    var grainSize: Float = 1.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.grainSize = value }
    var grainEnabled: Boolean = true
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.grainEnabled = value }
    var aberration: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.aberration = value }
    var aberrationDirection: Int = 0
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.aberrationDirection = value }
    var ev: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.ev = value }
    var whiteBalance: Float = 5000.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.whiteBalance = value }
    var noiseReduction: Int = 1
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.noiseReduction = value }
    var sharpening: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.sharpening = value }

    // Hardware Props
    var isoAuto: Boolean = true
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.isoAuto = value }
    var shutterSpeedAuto: Boolean = true
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.shutterSpeedAuto = value }
    var whiteBalanceAuto: Boolean = true
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.whiteBalanceAuto = value }
    var autoFocus: Boolean = false
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.autoFocus = value }
    var iso: Int = 400
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.iso = value }
    var exposureTime: Long = 1000000000L / 60
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.exposureTime = value }
    var focusDistance: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.focusDistance = value }
    
    var torchState: Float = 0.0f
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.torchState = value }
    var torchStrength: Int = 1
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.torchStrength = value }
    var cameraId: String? = null
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.cameraId = value }
    var aspectRatio: Int = 1
        set(value) { 
            if (field != value) {
                field = value
                if (::propSynchronizer.isInitialized) propSynchronizer.aspectRatio = value
            }
        }
    var targetFps: Int = 60
        set(value) { field = value; if (::propSynchronizer.isInitialized) propSynchronizer.targetFps = value }

    init {
        setEGLContextClientVersion(2)
        
        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {
                post { cameraEngine.start(surfaceTexture) }
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
                renderer.cameraWidth = width
                renderer.cameraHeight = height
            }

            override fun onPhotoCaptured(uri: String) {
                onPhotoCaptured(mapOf("uri" to uri))
            }
        }

        renderer = FilmRenderer(rendererListener)
        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), cameraListener)
        updateScheduler = CameraUpdateScheduler(
            onUpdateCameraControls = {
                if (::cameraEngine.isInitialized) {
                    cameraEngine.updateCameraControls()
                }
            }
        )
        propSynchronizer = CameraPropSynchronizer(cameraEngine.config, renderer, updateScheduler)

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY

        // Initialize engine config with current view props
        propSynchronizer.syncConfig()
    }


    fun takePhoto() {
        if (::cameraEngine.isInitialized) cameraEngine.takePicture()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (::cameraEngine.isInitialized) {
            cameraEngine.config.viewportWidth = w.toFloat()
            cameraEngine.config.viewportHeight = h.toFloat()
        }
    }

    fun release() {
        if (::updateScheduler.isInitialized) updateScheduler.release()
        if (::cameraEngine.isInitialized) cameraEngine.release()
        if (::renderer.isInitialized) renderer.release()
    }
}
