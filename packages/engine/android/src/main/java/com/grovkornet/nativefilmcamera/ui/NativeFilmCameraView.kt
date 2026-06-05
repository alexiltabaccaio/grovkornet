package com.grovkornet.nativefilmcamera.ui

import android.content.Context
import android.graphics.SurfaceTexture
import android.util.Log
import android.view.Choreographer
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CameraCharacteristics
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.rendering.LiveFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.managers.CameraTorchManager
import expo.modules.kotlin.viewevent.EventDispatcher
import com.grovkornet.nativefilmcamera.BuildConfig
import android.graphics.Bitmap
import android.view.PixelCopy
import java.io.File
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class NativeFilmCameraView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {

    @Volatile private var isReleased = false
    @Volatile private var lastReconfigureTime = 0L

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
    val onTorchStateChanged by EventDispatcher()

    private val cameraTorchManager: CameraTorchManager


    companion object {
        @Volatile var activeInstance: NativeFilmCameraView? = null
    }

    fun updateEffect(action: CameraConfiguration.() -> Unit) {
        synchronized(config) {
            config.action()
            renderThread?.updateConfig(config)
        }
    }

    fun updateHardware(action: CameraConfiguration.() -> Unit) {
        synchronized(config) {
            val oldCam = config.cameraId
            val oldRes = config.resolutionSetting
            val oldPrev = config.previewIn4k
            val oldAspect = config.aspectRatio
            val oldSelfie = config.isSelfieCamera
            config.action()
            if (oldCam != config.cameraId || oldRes != config.resolutionSetting || oldPrev != config.previewIn4k || oldAspect != config.aspectRatio || oldSelfie != config.isSelfieCamera) {
                lastReconfigureTime = System.currentTimeMillis()
                renderThread?.notifyHardwareChange()
            }
            renderThread?.updateConfig(config)
        }
        if (BuildConfig.DEBUG) {
            Log.d("NativeFilmCameraView", "Hardware update scheduled for config change")
        }
        updateScheduler?.schedule()
    }

    fun updateBoth(action: CameraConfiguration.() -> Unit) {
        synchronized(config) {
            val oldCam = config.cameraId
            val oldRes = config.resolutionSetting
            val oldPrev = config.previewIn4k
            val oldAspect = config.aspectRatio
            val oldSelfie = config.isSelfieCamera
            config.action()
            if (oldCam != config.cameraId || oldRes != config.resolutionSetting || oldPrev != config.previewIn4k || oldAspect != config.aspectRatio || oldSelfie != config.isSelfieCamera) {
                lastReconfigureTime = System.currentTimeMillis()
                renderThread?.notifyHardwareChange()
            }
            renderThread?.updateConfig(config)
        }
        if (BuildConfig.DEBUG) {
            Log.d("NativeFilmCameraView", "Hardware+Effect update scheduled for config change")
        }
        updateScheduler?.schedule()
    }
    fun setSecureMode(enabled: Boolean) {
        val isDebuggable = (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        if (isDebuggable) {
            this.setSecure(enabled)
        } else {
            // In production (Release build), we ALWAYS force security by bypassing React Native
            this.setSecure(true)
        }
    }

    init {
        activeInstance = this
        // Obscures the video feed in screenshots and screen recordings (hardware FLAG_SECURE)
        this.setSecure(true)
        holder.addCallback(this)

        val cameraListener = object : CameraEngine.Listener {
            override fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int) {
                if (isReleased) return
                this@NativeFilmCameraView.onExposureUpdate(mapOf(
                    "iso" to iso,
                    "shutterSpeed" to shutterSpeed,
                    "focusDistance" to focusDistance.toDouble(),
                    "noiseReduction" to noiseReduction
                ))
            }

            override fun onCapabilitiesUpdate(capabilities: WritableMap) {
                if (isReleased) return
                @Suppress("UNCHECKED_CAST")
                this@NativeFilmCameraView.onCapabilitiesUpdate(capabilities.toHashMap().filterValues { it != null } as Map<String, Any>)
            }

            override fun onCameraResolutionDetected(width: Int, height: Int) {
                if (isReleased) return
                cameraWidth = width
                cameraHeight = height
                renderThread?.updateCameraResolution(width, height)
                
                this@NativeFilmCameraView.onDebugUpdate(mapOf(
                    "resolution" to "${width}x${height}"
                ))
            }

            override fun onPhotoCaptured(uri: String) {
                if (isReleased) return
                this@NativeFilmCameraView.onPhotoCaptured(mapOf("uri" to uri))
            }
        }

        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), config, cameraListener)
        updateScheduler = CameraUpdateScheduler(
            onUpdateCameraControls = {
                cameraEngine?.updateCameraControls()
            }
        )

        cameraTorchManager = CameraTorchManager.create(
            context = context,
            getTargetCameraId = { config.cameraId ?: CameraTorchManager.getBackCameraIdFallback(context) },
            isTorchLogicalEnabled = { config.torchEnabled },
            onTorchStateChanged = { enabled ->
                if (System.currentTimeMillis() - lastReconfigureTime < 2000) {
                    if (BuildConfig.DEBUG) {
                        Log.d("NativeFilmCameraView", "Ignoring torch state change during reconfiguration window")
                    }
                    return@create
                }
                if (config.torchEnabled != enabled) {
                    config.torchEnabled = enabled
                    updateScheduler?.schedule()
                }
                if (!isReleased) {
                    onTorchStateChanged(mapOf("enabled" to enabled))
                }
            }
        ).apply {
            initialize()
        }
        ProcessLifecycleOwner.get().lifecycle.addObserver(cameraTorchManager)

    }

    fun takePhoto() {
        com.grovkornet.nativefilmcamera.capture.ThumbnailCaptureService.captureThumbnail(
            view = this,
            surfaceWidth = surfaceWidth,
            surfaceHeight = surfaceHeight,
            onThumbnailCaptured = { previewUri ->
                if (!isReleased) {
                    onPhotoCaptured(mapOf("uri" to previewUri))
                }
            }
        )

        cameraEngine?.takePicture()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        if (BuildConfig.DEBUG) {
            Log.i("NativeFilmCameraView", "Surface created")
        }
        
        val thread = com.grovkornet.nativefilmcamera.rendering.FilmRenderThread(
            assetManager = context.assets,
            surfaceProvider = { holder.surface },
            onSurfaceTextureReady = { st ->
                cameraEngine?.start(st)
            },
            onDebugUpdate = { debugData ->
                onDebugUpdate(debugData)
            },
            onCameraFreezeDetected = {
                cameraEngine?.recoverFromFreeze()
            }
        )
        
        renderThread = thread
        
        thread.apply {
            updateConfig(config)
            start()
            // Access looper to block until the thread is fully started and handler/looper are ready
            looper
            updateDimensions(surfaceWidth, surfaceHeight)
        }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        if (BuildConfig.DEBUG) {
            Log.i("NativeFilmCameraView", "Surface changed: ${width}x${height}")
        }
        surfaceWidth = width
        surfaceHeight = height
        renderThread?.updateDimensions(width, height)
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        if (BuildConfig.DEBUG) {
            Log.i("NativeFilmCameraView", "Surface destroyed")
        }
        renderThread?.release()
        renderThread = null
    }

    fun release() {
        if (isReleased) return
        isReleased = true
        if (activeInstance == this) {
            activeInstance = null
        }
        if (BuildConfig.DEBUG) {
            Log.i("NativeFilmCameraView", "Releasing NativeFilmCameraView...")
        }

        cameraTorchManager.unregister()

        try {
            ProcessLifecycleOwner.get().lifecycle.removeObserver(cameraTorchManager)
        } catch (e: Exception) {
            Log.e("NativeFilmCameraView", "Failed to remove lifecycle observer", e)
        }

        updateScheduler?.release()
        cameraEngine?.release()
        
        renderThread?.release()
        renderThread = null

        cameraTorchManager.restoreTorchIfLogicalEnabled()
    }
}
