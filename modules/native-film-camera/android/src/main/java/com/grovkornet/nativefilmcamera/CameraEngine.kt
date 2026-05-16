package com.grovkornet.nativefilmcamera

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CaptureResult
import android.hardware.camera2.TotalCaptureResult
import android.util.Log
import android.util.Range
import android.util.Size
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.Camera2Interop
import androidx.camera.camera2.interop.CaptureRequestOptions
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageProxy
import androidx.camera.core.ImageCaptureException
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import android.media.MediaActionSound
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.logic.CameraLogicUtils
import com.grovkornet.nativefilmcamera.managers.GalleryManager
import com.grovkornet.nativefilmcamera.managers.HardwareCapabilitiesManager

class CameraEngine(private val context: Context, private val lifecycleOwner: LifecycleOwner, private val listener: Listener) {

    private val TAG = "CameraEngine"

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int)
        fun onCapabilitiesUpdate(capabilities: WritableMap)
        fun onCameraResolutionDetected(width: Int, height: Int)
        fun onPhotoCaptured(uri: String)
    }

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var imageCapture: ImageCapture? = null
    private var currentSurfaceTexture: android.graphics.SurfaceTexture? = null
    private val shutterSound = MediaActionSound()
    
    // Managers
    private val galleryManager = GalleryManager(context)
    private val capabilitiesManager = HardwareCapabilitiesManager(context)

    // Manual Camera Props
    @Volatile var isoAuto: Boolean = true
    @Volatile var shutterSpeedAuto: Boolean = true
    @Volatile var whiteBalanceAuto: Boolean = true
    @Volatile var autoFocus: Boolean = false
    @Volatile var iso: Int = 400
    @Volatile var exposureTime: Long = 1000000000L / 60
    @Volatile var focusDistance: Float = 0.0f
    @Volatile var ev: Float = 0.0f
    @Volatile var torchEnabled: Boolean = false
    @Volatile var torchStrength: Int = 1
    
    @Volatile var cameraId: String? = null

    // Effect Props for capture
    @Volatile var saturation: Float = 1.0f
    @Volatile var contrast: Float = 1.0f
    @Volatile var grainIntensity: Float = 0.0f
    @Volatile var grainChroma: Float = 0.0f
    @Volatile var grainSize: Float = 1.0f
    @Volatile var grainEnabled: Boolean = true
    @Volatile var aberration: Float = 0.0f
    @Volatile var aberrationDirection: Int = 0
    @Volatile var whiteBalance: Float = 5000.0f
    @Volatile var noiseReductionMode: Int = 1 
    @Volatile var sharpening: Float = 0.0f

    @Volatile var viewportWidth: Float = 1080f
    @Volatile var viewportHeight: Float = 1920f

    private val offscreenProcessor = OffscreenFilmProcessor()
    private var processingThread: HandlerThread? = null
    private var processingHandler: Handler? = null

    private var lastExposureUpdateTime = 0L

    fun start(surfaceTexture: android.graphics.SurfaceTexture) {
        currentSurfaceTexture = surfaceTexture
        Log.d(TAG, "Starting CameraEngine...")
        
        if (processingThread == null) {
            processingThread = HandlerThread("GrovkornetImageProcessor").apply { start() }
            processingHandler = Handler(processingThread!!.looper)
        }

        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()
            bindCameraUseCases()
        }, ContextCompat.getMainExecutor(context))
    }

    private fun bindCameraUseCases() {
        val provider = cameraProvider ?: return
        val surfaceTexture = currentSurfaceTexture ?: return

        val previewBuilder = Preview.Builder()
        configureHardwareCapabilities(previewBuilder)
        setupExposureCallback(previewBuilder)

        val preview = previewBuilder.build().also {
            it.setSurfaceProvider { request ->
                listener.onCameraResolutionDetected(request.resolution.width, request.resolution.height)
                surfaceTexture.setDefaultBufferSize(request.resolution.width, request.resolution.height)
                val surface = android.view.Surface(surfaceTexture)
                request.provideSurface(surface, ContextCompat.getMainExecutor(context)) { 
                    surface.release()
                }
            }
        }

        try {
            provider.unbindAll()
            val (selector, targetZoomRatio) = calculateCameraSelector()
            
            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                .build()
            
            shutterSound.load(MediaActionSound.SHUTTER_CLICK)
            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview, imageCapture)
            
            targetZoomRatio?.let {
                camera?.cameraControl?.setZoomRatio(it)
            }
            
            emitCapabilities()
            updateCameraControls()
            Log.i(TAG, "CameraX bound successfully to cameraId: $cameraId")
        } catch (e: Exception) {
            Log.e(TAG, "Use case binding failed", e)
        }
    }

    private fun configureHardwareCapabilities(builder: Preview.Builder) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val targetId = if (!cameraId.isNullOrEmpty()) cameraId!! else cameraManager.cameraIdList.firstOrNull { 
                cameraManager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK 
            }
            
            if (targetId != null) {
                val chars = cameraManager.getCameraCharacteristics(targetId)
                val fpsRanges = chars.get(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES)
                fpsRanges?.maxByOrNull { it.upper }?.let { builder.setTargetFrameRate(it) }
            }
            
            val resolutionSelector = androidx.camera.core.resolutionselector.ResolutionSelector.Builder()
                .setResolutionStrategy(
                    androidx.camera.core.resolutionselector.ResolutionStrategy(
                        Size(1920, 1080),
                        androidx.camera.core.resolutionselector.ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER
                    )
                )
                .build()
            builder.setResolutionSelector(resolutionSelector)
        } catch (e: Exception) {
            Log.e(TAG, "Error configuring hardware capabilities", e)
        }
    }

    private fun setupExposureCallback(builder: Preview.Builder) {
        Camera2Interop.Extender(builder).setSessionCaptureCallback(object : CameraCaptureSession.CaptureCallback() {
            override fun onCaptureCompleted(session: CameraCaptureSession, request: CaptureRequest, result: TotalCaptureResult) {
                val now = System.currentTimeMillis()
                if (now - lastExposureUpdateTime >= 250) { // Slightly increased interval for stability
                    val currentIso = result.get(CaptureResult.SENSOR_SENSITIVITY) ?: return
                    val currentShutter = result.get(CaptureResult.SENSOR_EXPOSURE_TIME) ?: return
                    val currentFocus = result.get(CaptureResult.LENS_FOCUS_DISTANCE) ?: 0.0f
                    val currentNR = result.get(CaptureResult.NOISE_REDUCTION_MODE) ?: 1
                    val shutterDenominator = 1_000_000_000.0 / currentShutter.toDouble()
                    
                    listener.onExposureUpdate(currentIso, shutterDenominator, currentFocus, currentNR)
                    lastExposureUpdateTime = now
                }
            }
        })
    }

    private fun calculateCameraSelector(): Pair<CameraSelector, Float?> {
        var selectedSelector = CameraSelector.DEFAULT_BACK_CAMERA
        var targetZoomRatio: Float? = null
        
        if (cameraId.isNullOrEmpty()) return Pair(selectedSelector, null)

        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
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
                targetZoomRatio = CameraLogicUtils.calculatePhysicalZoomRatio(cameraManager, parentLogicalId, cameraId!!)
                builder.addCameraFilter { it.filter { c -> Camera2CameraInfo.from(c).cameraId == parentLogicalId } }
                builder.setPhysicalCameraId(cameraId!!)
            } else {
                builder.addCameraFilter { it.filter { c -> Camera2CameraInfo.from(c).cameraId == parentLogicalId } }
            }
            selectedSelector = builder.build()
        }
        
        return Pair(selectedSelector, targetZoomRatio)
    }

    fun updateCameraControls() {
        val currentCamera = camera ?: return
        try {
            val control = Camera2CameraControl.from(currentCamera.cameraControl)
            val builder = CaptureRequestOptions.Builder()
            
            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(60, 60))
            
            if (isoAuto && shutterSpeedAuto) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_EXPOSURE_COMPENSATION, ev.toInt())
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_SENSITIVITY, iso)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_EXPOSURE_TIME, exposureTime)
            }

            if (noiseReductionMode != -1) {
                builder.setCaptureRequestOption(CaptureRequest.NOISE_REDUCTION_MODE, noiseReductionMode)
                builder.setCaptureRequestOption(CaptureRequest.EDGE_MODE, noiseReductionMode)
            }

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, if (whiteBalanceAuto) CaptureRequest.CONTROL_AWB_MODE_AUTO else CaptureRequest.CONTROL_AWB_MODE_OFF)
            
            if (autoFocus) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.LENS_FOCUS_DISTANCE, focusDistance)
            }

            if (torchEnabled) {
                currentCamera.cameraControl.enableTorch(true)
                try {
                    currentCamera.cameraControl.setTorchStrengthLevel(torchStrength)
                } catch (e: Exception) {
                    Log.w(TAG, "setTorchStrengthLevel failed: ${e.message}")
                }
            } else {
                currentCamera.cameraControl.enableTorch(false)
            }

            control.captureRequestOptions = builder.build()
            Log.d(TAG, "Camera controls updated: ISO=$iso, Shutter=$exposureTime, AF=$autoFocus")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update camera controls", e)
        }
    }

    private fun emitCapabilities() {
        val event = Arguments.createMap()
        capabilitiesManager.populateCapabilities(event, camera)
        listener.onCapabilitiesUpdate(event)
    }

    fun takePicture() {
        val capture = imageCapture ?: return
        shutterSound.play(MediaActionSound.SHUTTER_CLICK)
        
        val params = OffscreenFilmProcessor.Parameters(
            saturation = saturation, contrast = contrast,
            aberration = aberration, aberrationDirection = aberrationDirection,
            grainIntensity = grainIntensity, grainChroma = grainChroma,
            grainSize = grainSize, grainEnabled = grainEnabled,
            ev = ev, whiteBalance = whiteBalance, sharpening = sharpening,
            time = (System.currentTimeMillis() % 10000) / 1000f,
            viewportWidth = viewportWidth, viewportHeight = viewportHeight
        )

        capture.takePicture(ContextCompat.getMainExecutor(context), object : ImageCapture.OnImageCapturedCallback() {
            override fun onCaptureSuccess(image: ImageProxy) {
                val rotation = image.imageInfo.rotationDegrees
                val buffer = image.planes[0].buffer
                val bytes = ByteArray(buffer.remaining())
                buffer.get(bytes)
                
                processingHandler?.post {
                    val procStartTime = System.currentTimeMillis()
                    try {
                        var bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                        if (rotation != 0) {
                            val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
                            val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
                            bitmap.recycle()
                            bitmap = rotated
                        }

                        val processed = offscreenProcessor.process(bitmap, params)
                        bitmap.recycle()

                        val uri = galleryManager.saveToGallery(processed)
                        processed.recycle()

                        uri?.let { listener.onPhotoCaptured(it.toString()) }
                        Log.i(TAG, "Processing complete in ${System.currentTimeMillis() - procStartTime}ms: $uri")
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to process photo", e)
                    } finally {
                        image.close()
                    }
                }
            }

            override fun onError(exception: ImageCaptureException) {
                Log.e(TAG, "Photo capture failed", exception)
            }
        })
    }

    fun release() {
        Log.d(TAG, "Releasing CameraEngine resources...")
        processingHandler?.post {
            offscreenProcessor.release()
            processingThread?.quitSafely()
            processingThread = null
            processingHandler = null
        }
        
        cameraProvider?.unbindAll()
        cameraProvider = null
        camera = null
        imageCapture = null
        currentSurfaceTexture = null
    }
}
