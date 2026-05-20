package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.graphics.SurfaceTexture
import android.util.Log
import android.util.Size
import android.view.Surface
import androidx.camera.core.AspectRatio
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.AspectRatioStrategy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import android.view.OrientationEventListener
import com.grovkornet.nativefilmcamera.logic.CameraLogicUtils
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class CameraSessionManager(
    private val context: Context,
    private val lifecycleOwner: LifecycleOwner,
    private val config: CameraConfiguration,
    private val listener: Listener
) {
    private val TAG = "CameraSessionManager"

    interface Listener {
        fun onCameraResolutionDetected(width: Int, height: Int)
        fun onCameraReady(camera: Camera, imageCapture: ImageCapture)
    }

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var imageCapture: ImageCapture? = null

    private val orientationEventListener by lazy {
        object : OrientationEventListener(context) {
            override fun onOrientationChanged(orientation: Int) {
                if (orientation == ORIENTATION_UNKNOWN) return
                val rotation = when (orientation) {
                    in 45..134 -> Surface.ROTATION_270 // Reverse landscape
                    in 135..224 -> Surface.ROTATION_180 // Reverse portrait
                    in 225..314 -> Surface.ROTATION_90 // Landscape
                    else -> Surface.ROTATION_0 // Portrait
                }
                imageCapture?.targetRotation = rotation
            }
        }
    }

    fun start(surfaceTexture: SurfaceTexture, captureCallback: android.hardware.camera2.CameraCaptureSession.CaptureCallback? = null) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
            bindCameraUseCases(surfaceTexture, captureCallback)
        }, ContextCompat.getMainExecutor(context))
    }

    fun bindCameraUseCases(surfaceTexture: SurfaceTexture, captureCallback: android.hardware.camera2.CameraCaptureSession.CaptureCallback? = null) {
        val provider = cameraProvider ?: return

        val targetAspectRatio = if (config.aspectRatio == 1) AspectRatio.RATIO_16_9 else AspectRatio.RATIO_4_3
        
        val targetSize = when (config.resolutionSetting) {
            0 -> null // 4K / Highest
            1 -> Size(1920, 1080) // 1080p
            2 -> Size(1280, 720)  // 720p
            3 -> Size(720, 480)   // 480p
            4 -> Size(640, 360)   // 360p
            5 -> Size(426, 240)   // 240p
            6 -> Size(256, 144)   // 144p
            else -> Size(1920, 1080)
        }

        val resolutionStrategy = if (targetSize != null) {
            ResolutionStrategy(targetSize, ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER)
        } else {
            ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY
        }

        val resolutionSelector = ResolutionSelector.Builder()
            .setAspectRatioStrategy(AspectRatioStrategy(targetAspectRatio, AspectRatioStrategy.FALLBACK_RULE_AUTO))
            .setResolutionStrategy(resolutionStrategy)
            .build()

        val previewBuilder = Preview.Builder()
            .setResolutionSelector(resolutionSelector)
        
        captureCallback?.let {
            androidx.camera.camera2.interop.Camera2Interop.Extender(previewBuilder)
                .setSessionCaptureCallback(it)
        }

        val preview = previewBuilder.build().also {
                it.setSurfaceProvider { request ->
                    listener.onCameraResolutionDetected(request.resolution.width, request.resolution.height)
                    surfaceTexture.setDefaultBufferSize(request.resolution.width, request.resolution.height)
                    val surface = Surface(surfaceTexture)
                    request.provideSurface(surface, ContextCompat.getMainExecutor(context)) {
                        surface.release()
                    }
                }
            }

        try {
            provider.unbindAll()
            val (selector, targetZoomRatio) = calculateCameraSelector()

            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .setResolutionSelector(resolutionSelector)
                .build()

            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, imageCapture)

            targetZoomRatio?.let {
                camera?.cameraControl?.setZoomRatio(it)
            }

            camera?.let {
                listener.onCameraReady(it, imageCapture!!)
            }
            
            orientationEventListener.enable()
            Log.i(TAG, "CameraX bound successfully to cameraId: ${config.cameraId}")
        } catch (e: Exception) {
            Log.e(TAG, "Use case binding failed", e)
        }
    }

    private fun calculateCameraSelector(): Pair<CameraSelector, Float?> {
        val cameraId = config.cameraId
        var selectedSelector = CameraSelector.DEFAULT_BACK_CAMERA
        var targetZoomRatio: Float? = null

        if (cameraId.isNullOrEmpty()) return Pair(selectedSelector, null)

        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
        var parentLogicalId: String? = null
        var isPhysical = false

        for (id in cameraManager.cameraIdList) {
            val chars = cameraManager.getCameraCharacteristics(id)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                if (chars.physicalCameraIds.contains(cameraId)) {
                    parentLogicalId = id
                    isPhysical = true
                    break
                }
            }
            if (id == cameraId) {
                parentLogicalId = id
                break
            }
        }

        if (parentLogicalId != null) {
            val builder = CameraSelector.Builder()
            if (isPhysical) {
                targetZoomRatio = CameraLogicUtils.calculatePhysicalZoomRatio(cameraManager, parentLogicalId, cameraId)
                builder.addCameraFilter { it.filter { c -> 
                    androidx.camera.camera2.interop.Camera2CameraInfo.from(c).cameraId == parentLogicalId 
                } }
                builder.setPhysicalCameraId(cameraId)
            } else {
                builder.addCameraFilter { it.filter { c -> 
                    androidx.camera.camera2.interop.Camera2CameraInfo.from(c).cameraId == parentLogicalId 
                } }
            }
            selectedSelector = builder.build()
        }

        return Pair(selectedSelector, targetZoomRatio)
    }

    fun release() {
        orientationEventListener.disable()
        cameraProvider?.unbindAll()
        cameraProvider = null
        camera = null
        imageCapture = null
    }
}
