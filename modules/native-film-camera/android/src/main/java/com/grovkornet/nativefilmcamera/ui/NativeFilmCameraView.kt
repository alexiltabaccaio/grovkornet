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

    private val mainHandler = Handler(Looper.getMainLooper())
    private var isCameraUpdatePending = false
    private var lastCameraUpdateTime = 0L
    private val hardwareUpdateCount = java.util.concurrent.atomic.AtomicInteger(0)
    private var lastDebugTime = 0L

    // Event Dispatchers (Expo Modules API)
    val onDebugUpdate by EventDispatcher()
    val onExposureUpdate by EventDispatcher()
    val onCapabilitiesUpdate by EventDispatcher()
    val onPhotoCaptured by EventDispatcher()

    // Props
    var saturation: Float = 1.0f
        set(value) { field = value; cameraEngine.config.saturation = value; if (::renderer.isInitialized) renderer.saturation = value }
    var contrast: Float = 1.0f
        set(value) { field = value; cameraEngine.config.contrast = value; if (::renderer.isInitialized) renderer.contrast = value }
    var grainIntensity: Float = 0.0f
        set(value) { field = value; cameraEngine.config.grainIntensity = value; if (::renderer.isInitialized) renderer.grainIntensity = value }
    var grainChroma: Float = 0.0f
        set(value) { field = value; cameraEngine.config.grainChroma = value; if (::renderer.isInitialized) renderer.grainChroma = value }
    var grainSize: Float = 1.0f
        set(value) { field = value; cameraEngine.config.grainSize = value; if (::renderer.isInitialized) renderer.grainSize = value }
    var grainEnabled: Boolean = true
        set(value) { field = value; cameraEngine.config.grainEnabled = value; if (::renderer.isInitialized) renderer.grainEnabled = value }
    var aberration: Float = 0.0f
        set(value) { field = value; cameraEngine.config.aberration = value; if (::renderer.isInitialized) renderer.aberration = value }
    var aberrationDirection: Int = 0
        set(value) { field = value; cameraEngine.config.aberrationDirection = value; if (::renderer.isInitialized) renderer.aberrationDirection = value }
    var ev: Float = 0.0f
        set(value) { field = value; cameraEngine.config.ev = value; if (::renderer.isInitialized) renderer.ev = value; scheduleCameraUpdate() }
    var whiteBalance: Float = 5000.0f
        set(value) { field = value; cameraEngine.config.whiteBalance = value; if (::renderer.isInitialized) renderer.whiteBalance = value }
    var noiseReduction: Int = 1
        set(value) { field = value; cameraEngine.config.noiseReduction = value; scheduleCameraUpdate() }
    var sharpening: Float = 0.0f
        set(value) { field = value; cameraEngine.config.sharpening = value; if (::renderer.isInitialized) renderer.sharpening = value }

    // Hardware Props
    var isoAuto: Boolean = true
        set(value) { field = value; cameraEngine.config.isoAuto = value; scheduleCameraUpdate() }
    var shutterSpeedAuto: Boolean = true
        set(value) { field = value; cameraEngine.config.shutterSpeedAuto = value; scheduleCameraUpdate() }
    var whiteBalanceAuto: Boolean = true
        set(value) { field = value; cameraEngine.config.whiteBalanceAuto = value; if (::renderer.isInitialized) renderer.whiteBalanceAuto = value; scheduleCameraUpdate() }
    var autoFocus: Boolean = false
        set(value) { field = value; cameraEngine.config.autoFocus = value; scheduleCameraUpdate() }
    var iso: Int = 400
        set(value) { field = value; cameraEngine.config.iso = value; if (!isoAuto) scheduleCameraUpdate() }
    var exposureTime: Long = 1000000000L / 60
        set(value) { field = value; cameraEngine.config.exposureTime = value; if (!shutterSpeedAuto) scheduleCameraUpdate() }
    var focusDistance: Float = 0.0f
        set(value) { field = value; cameraEngine.config.focusDistance = value; if (!autoFocus) scheduleCameraUpdate() }
    
    var torchState: Float = 0.0f
        set(value) { field = value; cameraEngine.config.torchEnabled = value > 0.5f; scheduleCameraUpdate() }
    var torchStrength: Int = 1
        set(value) { field = value; cameraEngine.config.torchStrength = value; scheduleCameraUpdate() }
    var cameraId: String? = null
        set(value) { field = value; cameraEngine.config.cameraId = value; scheduleCameraUpdate() }
    var aspectRatio: Int = 0
        set(value) { 
            if (field != value) {
                field = value
                cameraEngine.config.aspectRatio = value
                if (::renderer.isInitialized) renderer.aspectRatio = value
                scheduleCameraUpdate() 
            }
        }

    private val cameraUpdateRunnable = Runnable {
        isCameraUpdatePending = false
        lastCameraUpdateTime = System.currentTimeMillis()
        if (::cameraEngine.isInitialized) {
            cameraEngine.updateCameraControls()
            hardwareUpdateCount.incrementAndGet()
        }
    }

    private fun scheduleCameraUpdate() {
        val now = System.currentTimeMillis()
        val minInterval = 33L

        if (now - lastCameraUpdateTime >= minInterval) {
            lastCameraUpdateTime = now
            if (::cameraEngine.isInitialized) {
                cameraEngine.updateCameraControls()
                hardwareUpdateCount.incrementAndGet()
            }
        } else if (!isCameraUpdatePending) {
            isCameraUpdatePending = true
            val delay = minInterval - (now - lastCameraUpdateTime)
            mainHandler.postDelayed(cameraUpdateRunnable, delay)
        }
    }

    init {
        setEGLContextClientVersion(2)
        
        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {
                post { cameraEngine.start(surfaceTexture) }
            }

            override fun onFpsUpdate(fps: Int, resolution: String) {
                val now = System.currentTimeMillis()
                var hwFps = 0
                val count = hardwareUpdateCount.getAndSet(0)
                if (lastDebugTime > 0L) {
                    val dt = now - lastDebugTime
                    if (dt > 0) hwFps = ((count * 1000L) / dt).toInt()
                }
                lastDebugTime = now
                onDebugUpdate(mapOf("fps" to fps, "resolution" to resolution, "hwFps" to hwFps))
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

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY

        // Initialize engine config with current view props
        syncConfig()
    }

    private fun syncConfig() {
        val c = cameraEngine.config
        c.saturation = saturation
        c.contrast = contrast
        c.grainIntensity = grainIntensity
        c.grainChroma = grainChroma
        c.grainSize = grainSize
        c.grainEnabled = grainEnabled
        c.aberration = aberration
        c.aberrationDirection = aberrationDirection
        c.whiteBalance = whiteBalance
        c.ev = ev
        c.noiseReduction = noiseReduction
        c.sharpening = sharpening
        c.isoAuto = isoAuto
        c.shutterSpeedAuto = shutterSpeedAuto
        c.whiteBalanceAuto = whiteBalanceAuto
        c.autoFocus = autoFocus
        c.iso = iso
        c.exposureTime = exposureTime
        c.focusDistance = focusDistance
        c.torchEnabled = torchState > 0.5f
        c.torchStrength = torchStrength
        c.cameraId = cameraId
        c.aspectRatio = aspectRatio
        if (::renderer.isInitialized) renderer.aspectRatio = aspectRatio
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
        mainHandler.removeCallbacks(cameraUpdateRunnable)
        if (::cameraEngine.isInitialized) cameraEngine.release()
        if (::renderer.isInitialized) renderer.release()
    }
}
