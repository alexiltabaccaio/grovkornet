package com.grovkornet.nativefilmcamera

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLSurfaceView
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
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
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.saturation = value; if (::cameraEngine.isInitialized) cameraEngine.saturation = value } }
    var contrast: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.contrast = value; if (::cameraEngine.isInitialized) cameraEngine.contrast = value } }
    var grainIntensity: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainIntensity = value; if (::cameraEngine.isInitialized) cameraEngine.grainIntensity = value } }
    var grainChroma: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainChroma = value; if (::cameraEngine.isInitialized) cameraEngine.grainChroma = value } }
    var grainSize: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainSize = value; if (::cameraEngine.isInitialized) cameraEngine.grainSize = value } }
    var grainEnabled: Boolean = true
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainEnabled = value; if (::cameraEngine.isInitialized) cameraEngine.grainEnabled = value } }
    var aberration: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.aberration = value; if (::cameraEngine.isInitialized) cameraEngine.aberration = value } }
    var aberrationDirection: Int = 0
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.aberrationDirection = value; if (::cameraEngine.isInitialized) cameraEngine.aberrationDirection = value } }
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
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.whiteBalance = value; if (::cameraEngine.isInitialized) cameraEngine.whiteBalance = value } }

    var noiseReduction: Int = 1
        set(value) {
            if (field != value) {
                field = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.noiseReductionMode = value
                    scheduleCameraUpdate()
                }
            }
        }

    var sharpening: Float = 0.0f
        set(value) {
            if (field != value) {
                field = value
                if (::renderer.isInitialized) renderer.sharpening = value
                if (::cameraEngine.isInitialized) cameraEngine.sharpening = value
            }
        }

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
                    scheduleCameraUpdate()
                }
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
        val minInterval = 33L // ~30 FPS

        if (now - lastCameraUpdateTime >= minInterval) {
            // Apply immediately if enough time has passed (Leading-edge)
            lastCameraUpdateTime = now
            if (::cameraEngine.isInitialized) {
                cameraEngine.updateCameraControls()
                hardwareUpdateCount.incrementAndGet()
            }
        } else if (!isCameraUpdatePending) {
            // Schedule for later to maintain throttle
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
                    if (dt > 0) {
                        hwFps = ((count * 1000L) / dt).toInt()
                    }
                }
                lastDebugTime = now

                onDebugUpdate(mapOf(
                    "fps" to fps,
                    "resolution" to resolution,
                    "hwFps" to hwFps
                ))
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
                // Adapt WritableMap to Map if possible, or just pass it if Expo supports it
                // For simplicity, let's pass it as map
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

        cameraEngine.saturation = saturation
        cameraEngine.contrast = contrast
        cameraEngine.grainIntensity = grainIntensity
        cameraEngine.grainChroma = grainChroma
        cameraEngine.grainSize = grainSize
        cameraEngine.grainEnabled = grainEnabled
        cameraEngine.aberration = aberration
        cameraEngine.aberrationDirection = aberrationDirection
        cameraEngine.whiteBalance = whiteBalance
        cameraEngine.ev = ev
        cameraEngine.noiseReductionMode = noiseReduction
        cameraEngine.sharpening = sharpening
    }

    fun takePhoto() {
        if (::cameraEngine.isInitialized) {
            cameraEngine.takePicture()
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (::cameraEngine.isInitialized) {
            cameraEngine.viewportWidth = w.toFloat()
            cameraEngine.viewportHeight = h.toFloat()
        }
    }

    fun release() {
        mainHandler.removeCallbacks(cameraUpdateRunnable)
        if (::cameraEngine.isInitialized) cameraEngine.release()
        if (::renderer.isInitialized) renderer.release()
    }
}
