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
import com.grovkornet.nativefilmcamera.BuildConfig

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
    var currentBaseZoom: Float = 1.0f

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

        val isHighRes = config.resolutionSetting <= 1
        val targetAspectRatio = if (isHighRes) {
            if (config.force60fpsCrop) {
                AspectRatio.RATIO_16_9 // Force hardware to 16:9 for 4K and 1440p to bypass 30fps lock on 4:3 sensors
            } else {
                AspectRatio.RATIO_4_3 // Request full sensor width (4:3) at 30fps, shader will crop
            }
        } else {
            when (config.aspectRatio) {
                1, 4 -> AspectRatio.RATIO_16_9 // 16:9 and 65:24 map to 16:9
                else -> AspectRatio.RATIO_4_3 // 4:3, 1:1, 3:2 map to 4:3
            }
        }

        val is169 = targetAspectRatio == AspectRatio.RATIO_16_9
        
        val targetSize = when (config.resolutionSetting) {
            0 -> if (is169) Size(3840, 2160) else Size(3264, 2448) // 4K
            1 -> if (is169) Size(2560, 1440) else Size(2560, 1920) // 1440p
            2 -> if (is169) Size(1920, 1080) else Size(1920, 1440) // 1080p
            3 -> if (is169) Size(1280, 720) else Size(1280, 960)  // 720p
            4 -> if (is169) Size(720, 480) else Size(720, 540)   // 480p
            5 -> if (is169) Size(640, 360) else Size(640, 480)   // 360p
            6 -> if (is169) Size(426, 240) else Size(426, 320)   // 240p
            7 -> if (is169) Size(256, 144) else Size(256, 192)   // 144p
            else -> if (is169) Size(1920, 1080) else Size(1920, 1440)
        }

        val captureResolutionStrategy = ResolutionStrategy(targetSize, ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER)

        val captureResolutionSelector = ResolutionSelector.Builder()
            .setAspectRatioStrategy(AspectRatioStrategy(targetAspectRatio, AspectRatioStrategy.FALLBACK_RULE_AUTO))
            .setResolutionStrategy(captureResolutionStrategy)
            .build()

        val maxPreviewWidth = when (config.previewQuality) {
            0 -> 3840 // MASSIMA (fino a 4K)
            1 -> 1920 // OTTIMIZZATA (fino a 1080p)
            2 -> 1280 // RISPARMIO (fino a 720p)
            else -> 1920
        }
        
        val previewSize = if (targetSize.width > maxPreviewWidth) {
            if (is169) {
                when (config.previewQuality) {
                    2 -> Size(1280, 720)
                    else -> Size(1920, 1080)
                }
            } else {
                when (config.previewQuality) {
                    2 -> Size(1280, 960)
                    else -> Size(1920, 1440)
                }
            }
        } else {
            targetSize
        }

        val previewResolutionStrategy = ResolutionStrategy(previewSize, ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER)

        val previewResolutionSelector = ResolutionSelector.Builder()
            .setAspectRatioStrategy(AspectRatioStrategy(targetAspectRatio, AspectRatioStrategy.FALLBACK_RULE_AUTO))
            .setResolutionStrategy(previewResolutionStrategy)
            .build()

        val previewBuilder = Preview.Builder()
            .setResolutionSelector(previewResolutionSelector)
        
        val extender = androidx.camera.camera2.interop.Camera2Interop.Extender(previewBuilder)
        captureCallback?.let {
            extender.setSessionCaptureCallback(it)
        }
        if (config.torchEnabled) {
            extender.setCaptureRequestOption(android.hardware.camera2.CaptureRequest.FLASH_MODE, android.hardware.camera2.CaptureRequest.FLASH_MODE_TORCH)
            extender.setCaptureRequestOption(android.hardware.camera2.CaptureRequest.CONTROL_AE_MODE, android.hardware.camera2.CaptureRequest.CONTROL_AE_MODE_ON)
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
                .setCaptureMode(ImageCapture.CAPTURE_MODE_ZERO_SHUTTER_LAG)
                .setResolutionSelector(captureResolutionSelector)
                .build()

            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, imageCapture)

            currentBaseZoom = targetZoomRatio ?: 1.0f
            camera?.cameraControl?.setZoomRatio(currentBaseZoom * config.zoom)


            camera?.let {
                listener.onCameraReady(it, imageCapture!!)
            }
            
            orientationEventListener.enable()
            if (BuildConfig.DEBUG) {
                Log.i(TAG, "CameraX bound successfully to cameraId: ${config.cameraId}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Use case binding failed", e)
        }
    }

    private fun calculateCameraSelector(): Pair<CameraSelector, Float?> {
        if (config.isSelfieCamera) {
            return Pair(CameraSelector.DEFAULT_FRONT_CAMERA, null)
        }
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
