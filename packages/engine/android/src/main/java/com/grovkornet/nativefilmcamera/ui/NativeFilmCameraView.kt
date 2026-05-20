package com.grovkornet.nativefilmcamera.ui

import android.content.Context
import android.graphics.SurfaceTexture
import android.util.Log
import android.view.Choreographer
import android.view.SurfaceHolder
import android.view.SurfaceView
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.rendering.LiveFilmProcessor
import com.grovkornet.nativefilmcamera.rendering.utils.FrameTimingController
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import expo.modules.kotlin.viewevent.EventDispatcher

class NativeFilmCameraView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {

    @Volatile private var isReleased = false

    val config = CameraConfiguration()
    private var liveProcessor: LiveFilmProcessor? = null
    private var cameraEngine: CameraEngine? = null

    private var updateScheduler: CameraUpdateScheduler? = null
    private val timingController = FrameTimingController()

    private var currentSurfaceTexture: SurfaceTexture? = null
    private var isFrameAvailable = false
    private var surfaceWidth = 0
    private var surfaceHeight = 0

    @Volatile var cameraWidth = 0
    @Volatile var cameraHeight = 0

    // Event Dispatchers (Expo Modules API)
    val onDebugUpdate by EventDispatcher()
    val onExposureUpdate by EventDispatcher()
    val onCapabilitiesUpdate by EventDispatcher()
    val onPhotoCaptured by EventDispatcher()

    fun updateEffect(action: CameraConfiguration.() -> Unit) {
        config.action()
    }

    fun updateHardware(action: CameraConfiguration.() -> Unit) {
        config.action()
        Log.d("NativeFilmCameraView", "Hardware update scheduled for config change")
        updateScheduler?.schedule()
    }

    fun updateBoth(action: CameraConfiguration.() -> Unit) {
        config.action()
        Log.d("NativeFilmCameraView", "Hardware+Effect update scheduled for config change")
        updateScheduler?.schedule()
    }

    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (isReleased) return
            drawLiveFrame()
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    init {
        holder.addCallback(this)

        val cameraListener = object : CameraEngine.Listener {
            override fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int) {
                if (isReleased) return
                onExposureUpdate(mapOf(
                    "iso" to iso,
                    "shutterSpeed" to shutterSpeed,
                    "focusDistance" to focusDistance.toDouble(),
                    "noiseReduction" to noiseReduction
                ))
            }

            override fun onCapabilitiesUpdate(capabilities: WritableMap) {
                if (isReleased) return
                onCapabilitiesUpdate(capabilities.toHashMap())
            }

            override fun onCameraResolutionDetected(width: Int, height: Int) {
                if (isReleased) return
                cameraWidth = width
                cameraHeight = height
            }

            override fun onPhotoCaptured(uri: String) {
                if (isReleased) return
                onPhotoCaptured(mapOf("uri" to uri))
            }
        }

        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), config, cameraListener)
        updateScheduler = CameraUpdateScheduler(
            onUpdateCameraControls = {
                cameraEngine?.updateCameraControls()
            }
        )
    }

    private fun setupProcessorIfNeeded() {
        val width = surfaceWidth
        val height = surfaceHeight
        if (width <= 0 || height <= 0 || isReleased) return

        if (liveProcessor == null) {
            liveProcessor = LiveFilmProcessor()
        }

        if (currentSurfaceTexture == null) {
            currentSurfaceTexture = SurfaceTexture(0).apply {
                setDefaultBufferSize(width, height)
                setOnFrameAvailableListener {
                    isFrameAvailable = true
                }
            }
            cameraEngine?.start(currentSurfaceTexture!!)
        }

        liveProcessor?.prepare(currentSurfaceTexture!!, width, height)
    }

    private fun drawLiveFrame() {
        val st = currentSurfaceTexture ?: return
        val surface = holder.surface ?: return
        if (!surface.isValid) return

        try {
            // Filament handles SurfaceTexture updates internally on its render thread.
            // Do NOT call st.updateTexImage() here as it lacks an EGL context!
            if (isFrameAvailable) {
                isFrameAvailable = false
            }

            timingController.updateFps { fps, stampedFps ->
                if (!isReleased) {
                    onDebugUpdate(mapOf(
                        "fps" to stampedFps,
                        "resolution" to "${cameraWidth}x${cameraHeight}",
                        "hwFps" to fps
                    ))
                }
            }

            val shouldCapture = timingController.shouldCaptureFrame(config.targetFps)
            if (shouldCapture) {
                val matrix = FloatArray(16)
                st.getTransformMatrix(matrix)
                liveProcessor?.renderLiveFrame(surface, config, matrix)
            }
        } catch (e: Exception) {
            Log.e("NativeFilmCameraView", "Error drawing live frame", e)
        }
    }

    fun takePhoto() {
        cameraEngine?.takePicture()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        Log.i("NativeFilmCameraView", "Surface created")
        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        Log.i("NativeFilmCameraView", "Surface changed: ${width}x${height}")
        surfaceWidth = width
        surfaceHeight = height
        setupProcessorIfNeeded()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        Log.i("NativeFilmCameraView", "Surface destroyed")
        Choreographer.getInstance().removeFrameCallback(frameCallback)
    }

    fun release() {
        if (isReleased) return
        isReleased = true
        Log.i("NativeFilmCameraView", "Releasing NativeFilmCameraView...")

        Choreographer.getInstance().removeFrameCallback(frameCallback)
        updateScheduler?.release()
        cameraEngine?.release()
        
        liveProcessor?.release()
        liveProcessor = null

        currentSurfaceTexture?.release()
        currentSurfaceTexture = null
    }
}
