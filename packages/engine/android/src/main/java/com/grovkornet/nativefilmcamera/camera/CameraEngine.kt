package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.graphics.SurfaceTexture
import androidx.camera.core.Camera
import androidx.camera.core.ImageCapture
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.capture.CapturePipeline
import com.grovkornet.nativefilmcamera.managers.GalleryManager
import com.grovkornet.nativefilmcamera.managers.HardwareCapabilitiesManager
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class CameraEngine(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    val config: CameraConfiguration,
    private val listener: Listener
) : CameraSessionManager.Listener, CameraControlManager.Listener, CapturePipeline.Listener {

    private val TAG = "CameraEngine"

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int)
        fun onCapabilitiesUpdate(capabilities: WritableMap)
        fun onCameraResolutionDetected(width: Int, height: Int)
        fun onPhotoCaptured(uri: String)
    }

    // Specialized Managers
    private val sessionManager = CameraSessionManager(context, lifecycleOwner, config, this)
    private val controlManager = CameraControlManager(context, config, this)
    private val capturePipeline = CapturePipeline(context, config, GalleryManager(context), this)
    private val capabilitiesManager = HardwareCapabilitiesManager(context)

    private var activeCamera: Camera? = null
    private var activeImageCapture: ImageCapture? = null
    
    private var lastBoundCameraId: String? = null
    private var lastBoundAspectRatio: Int = -1
    private var lastBoundResolutionSetting: Int = -1
    private var lastBoundPreviewIn4K: Boolean? = null
    private var lastBoundForce4k60fpsCrop: Boolean? = null
    private var lastBoundSelfieCamera: Boolean? = null
    private var currentSurfaceTexture: SurfaceTexture? = null

    fun start(surfaceTexture: SurfaceTexture) {
        currentSurfaceTexture = surfaceTexture
        lastBoundCameraId = config.cameraId
        lastBoundAspectRatio = config.aspectRatio
        lastBoundResolutionSetting = config.resolutionSetting
        lastBoundPreviewIn4K = config.previewIn4k
        lastBoundForce4k60fpsCrop = config.force4k60fpsCrop
        lastBoundSelfieCamera = config.isSelfieCamera
        sessionManager.start(surfaceTexture, controlManager.createCaptureCallback())
    }

    fun updateCameraControls() {
        if (config.cameraId != lastBoundCameraId || 
            config.resolutionSetting != lastBoundResolutionSetting ||
            config.previewIn4k != lastBoundPreviewIn4K ||
            config.aspectRatio != lastBoundAspectRatio ||
            config.force4k60fpsCrop != lastBoundForce4k60fpsCrop ||
            config.isSelfieCamera != lastBoundSelfieCamera
        ) {
            lastBoundCameraId = config.cameraId
            lastBoundAspectRatio = config.aspectRatio
            lastBoundResolutionSetting = config.resolutionSetting
            lastBoundPreviewIn4K = config.previewIn4k
            lastBoundForce4k60fpsCrop = config.force4k60fpsCrop
            lastBoundSelfieCamera = config.isSelfieCamera
            currentSurfaceTexture?.let { 
                sessionManager.bindCameraUseCases(it, controlManager.createCaptureCallback())
            }
            return
        }
        activeCamera?.let { controlManager.updateControls(it) }
    }

    fun takePicture() {
        activeImageCapture?.let { capturePipeline.takePicture(it) }
    }

    private fun emitCapabilities() {
        val event = Arguments.createMap()
        capabilitiesManager.populateCapabilities(event, activeCamera)
        listener.onCapabilitiesUpdate(event)
    }

    // --- SessionManager.Listener ---
    override fun onCameraResolutionDetected(width: Int, height: Int) {
        listener.onCameraResolutionDetected(width, height)
    }

    override fun onCameraReady(camera: Camera, imageCapture: ImageCapture) {
        activeCamera = camera
        activeImageCapture = imageCapture
        
        emitCapabilities()
        updateCameraControls()
    }

    // --- ControlManager.Listener ---
    override fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int) {
        listener.onExposureUpdate(iso, shutterSpeed, focusDistance, noiseReduction)
    }

    // --- CapturePipeline.Listener ---
    override fun onPhotoCaptured(uri: String) {
        listener.onPhotoCaptured(uri)
    }

    fun release() {
        if (capturePipeline.hasActiveCaptures()) {
            capturePipeline.setOnCapturesFinishedListener {
                androidx.core.content.ContextCompat.getMainExecutor(context).execute {
                    sessionManager.release()
                    activeCamera = null
                    activeImageCapture = null
                }
            }
            capturePipeline.release()
        } else {
            sessionManager.release()
            capturePipeline.release()
            activeCamera = null
            activeImageCapture = null
        }
    }
}
