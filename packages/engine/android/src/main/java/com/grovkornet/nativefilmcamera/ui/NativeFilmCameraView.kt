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
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import expo.modules.kotlin.viewevent.EventDispatcher

class NativeFilmCameraView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {

    @Volatile private var isReleased = false

    val config = CameraConfiguration()
    private var cameraEngine: CameraEngine? = null
    private var renderThread: com.grovkornet.nativefilmcamera.rendering.FilmRenderThread? = null

    private var updateScheduler: CameraUpdateScheduler? = null

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
        renderThread?.updateConfig(config)
    }

    fun updateHardware(action: CameraConfiguration.() -> Unit) {
        config.action()
        renderThread?.updateConfig(config)
        Log.d("NativeFilmCameraView", "Hardware update scheduled for config change")
        updateScheduler?.schedule()
    }

    fun updateBoth(action: CameraConfiguration.() -> Unit) {
        config.action()
        renderThread?.updateConfig(config)
        Log.d("NativeFilmCameraView", "Hardware+Effect update scheduled for config change")
        updateScheduler?.schedule()
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
                renderThread?.updateCameraResolution(width, height)
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

    fun takePhoto() {
        cameraEngine?.takePicture()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        Log.i("NativeFilmCameraView", "Surface created")
        
        renderThread = com.grovkornet.nativefilmcamera.rendering.FilmRenderThread(
            assetManager = context.assets,
            surfaceProvider = { holder.surface },
            onSurfaceTextureReady = { st ->
                cameraEngine?.start(st)
            },
            onDebugUpdate = { debugData ->
                onDebugUpdate(debugData)
            }
        ).apply {
            updateConfig(config)
            start()
            // Access looper to block until the thread is fully started and handler/looper are ready
            val threadLooper = looper
            updateDimensions(surfaceWidth, surfaceHeight)
        }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        Log.i("NativeFilmCameraView", "Surface changed: ${width}x${height}")
        surfaceWidth = width
        surfaceHeight = height
        renderThread?.updateDimensions(width, height)
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        Log.i("NativeFilmCameraView", "Surface destroyed")
        renderThread?.release()
        renderThread = null
    }

    fun release() {
        if (isReleased) return
        isReleased = true
        Log.i("NativeFilmCameraView", "Releasing NativeFilmCameraView...")

        updateScheduler?.release()
        cameraEngine?.release()
        
        renderThread?.release()
        renderThread = null
    }
}
