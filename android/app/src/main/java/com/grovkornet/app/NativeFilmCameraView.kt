package com.grovkornet.app

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLSurfaceView
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class NativeFilmCameraView(context: Context) : GLSurfaceView(context) {

    private lateinit var renderer: FilmRenderer
    private lateinit var cameraEngine: CameraEngine

    private val mainHandler = Handler(Looper.getMainLooper())
    private var isCameraUpdatePending = false
    private val hardwareUpdateCount = java.util.concurrent.atomic.AtomicInteger(0)
    private var lastDebugTime = 0L

    private val cameraUpdateRunnable = Runnable {
        if (::cameraEngine.isInitialized) {
            cameraEngine.updateCameraControls()
            hardwareUpdateCount.incrementAndGet()
        }
        isCameraUpdatePending = false
    }

    private fun scheduleCameraUpdate() {
        if (!isCameraUpdatePending) {
            isCameraUpdatePending = true
            mainHandler.postDelayed(cameraUpdateRunnable, 66) // ~15 FPS throttler
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
                    if (dt > 0) {
                        hwFps = ((count * 1000L) / dt).toInt()
                    }
                }
                lastDebugTime = now

                val event = Arguments.createMap().apply {
                    putInt("fps", fps)
                    putString("resolution", resolution)
                    putInt("hwFps", hwFps)
                }
                emitEvent("onDebugUpdate", event)
            }

            override fun requestRender() {
                this@NativeFilmCameraView.requestRender()
            }
        }

        val cameraListener = object : CameraEngine.Listener {
            override fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float) {
                val event = Arguments.createMap().apply {
                    putInt("iso", iso)
                    putDouble("shutterSpeed", shutterSpeed)
                    putDouble("focusDistance", focusDistance.toDouble())
                }
                emitEvent("onExposureUpdate", event)
            }

            override fun onCapabilitiesUpdate(capabilities: WritableMap) {
                emitEvent("onCapabilitiesUpdate", capabilities)
            }

            override fun onCameraResolutionDetected(width: Int, height: Int) {
                renderer.cameraWidth = width
                renderer.cameraHeight = height
            }
        }

        renderer = FilmRenderer(rendererListener)
        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), cameraListener)

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY
    }

    // Props from React Native
    var saturation: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.saturation = value } }
    var contrast: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.contrast = value } }
    var grainIntensity: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainIntensity = value } }
    var grainChroma: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainChroma = value } }
    var grainSize: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainSize = value } }
    var grainEnabled: Boolean = true
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainEnabled = value } }
    var aberration: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.aberration = value } }
    var ev: Float = 0.0f
        set(value) { 
            if (field != value) { 
                field = value
                if (::renderer.isInitialized) renderer.ev = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.ev = value
                    scheduleCameraUpdate()
                }
            } 
        }
    var whiteBalance: Float = 5000.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.whiteBalance = value } }

    // Manual Camera Props
    var isoAuto: Boolean = true
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.isoAuto = value; scheduleCameraUpdate() } } }
    var shutterSpeedAuto: Boolean = true
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.shutterSpeedAuto = value; scheduleCameraUpdate() } } }
    var whiteBalanceAuto: Boolean = true
        set(value) { 
            if (field != value) { 
                field = value
                if (::cameraEngine.isInitialized) { 
                    cameraEngine.whiteBalanceAuto = value
                    scheduleCameraUpdate() 
                }
                if (::renderer.isInitialized) {
                    renderer.whiteBalanceAuto = value
                }
            } 
        }
    var autoFocus: Boolean = false
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.autoFocus = value; scheduleCameraUpdate() } } }
    var iso: Int = 400
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.iso = value; scheduleCameraUpdate() } } }
    var exposureTime: Long = 1000000000L / 60
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.exposureTime = value; scheduleCameraUpdate() } } }
    var focusDistance: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.focusDistance = value; scheduleCameraUpdate() } } }
    
    var torchState: Float = 0.0f
        set(value) {
            if (field != value) {
                field = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.torchEnabled = value > 0.5f
                    scheduleCameraUpdate()
                }
            }
        }
    
    var torchStrength: Int = 1
        set(value) {
            if (field != value) {
                field = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.torchStrength = value
                    scheduleCameraUpdate()
                }
            }
        }
    
    var cameraId: String? = null
        set(value) {
            if (field != value) {
                field = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.cameraId = value
                    // Cambiamento camera è pesante, meglio triggerare subito ma con throttling per sicurezza se chiamato in rapida successione
                    scheduleCameraUpdate()
                }
            }
        }

    private fun emitEvent(name: String, event: WritableMap) {
        val reactContext = context as? ThemedReactContext
        reactContext?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(id, name, event)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        mainHandler.removeCallbacks(cameraUpdateRunnable)
        if (::cameraEngine.isInitialized) cameraEngine.release()
        if (::renderer.isInitialized) renderer.release()
    }
}
