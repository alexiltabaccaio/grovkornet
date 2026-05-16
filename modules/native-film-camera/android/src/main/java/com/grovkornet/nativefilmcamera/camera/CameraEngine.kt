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
    private val listener: Listener
) : CameraSessionManager.Listener, CameraControlManager.Listener, CapturePipeline.Listener {

    private val TAG = "CameraEngine"

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int)
        fun onCapabilitiesUpdate(capabilities: WritableMap)
        fun onCameraResolutionDetected(width: Int, height: Int)
        fun onPhotoCaptured(uri: String)
    }

    // Single source of truth
    val config = CameraConfiguration()

    // Specialized Managers
    private val sessionManager = CameraSessionManager(context, lifecycleOwner, config, this)
    private val controlManager = CameraControlManager(context, config, this)
    private val capturePipeline = CapturePipeline(context, config, GalleryManager(context), this)
    private val capabilitiesManager = HardwareCapabilitiesManager(context)

    private var activeCamera: Camera? = null
    private var activeImageCapture: ImageCapture? = null

    fun start(surfaceTexture: SurfaceTexture) {
        sessionManager.start(surfaceTexture, controlManager.createCaptureCallback())
    }

    fun updateCameraControls() {
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
        sessionManager.release()
        capturePipeline.release()
        activeCamera = null
        activeImageCapture = null
    }
}
