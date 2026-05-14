package com.grovkornet.app

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
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class CameraEngine(private val context: Context, private val lifecycleOwner: LifecycleOwner, private val listener: Listener) {

    private val TAG = "CameraEngine"

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float)
        fun onCapabilitiesUpdate(capabilities: WritableMap)
        fun onCameraResolutionDetected(width: Int, height: Int)
    }

    private var cameraProvider: ProcessCameraProvider? = null
    private var camera: Camera? = null
    private var currentSurfaceTexture: android.graphics.SurfaceTexture? = null

    // Manual Camera Props
    @Volatile var isoAuto: Boolean = true
    @Volatile var shutterSpeedAuto: Boolean = true
    @Volatile var whiteBalanceAuto: Boolean = true
    @Volatile var autoFocus: Boolean = false
    @Volatile var iso: Int = 400
    @Volatile var exposureTime: Long = 1000000000L / 60
    @Volatile var focusDistance: Float = 0.0f
    @Volatile var ev: Float = 0.0f
    
    @Volatile var cameraId: String? = null

    private var lastExposureUpdateTime = 0L

    fun start(surfaceTexture: android.graphics.SurfaceTexture) {
        currentSurfaceTexture = surfaceTexture
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
        
        // Dynamic hardware capability detection
        configureHardwareCapabilities(previewBuilder)
        
        // Real-time exposure feedback loop
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
            
            camera = provider.bindToLifecycle(lifecycleOwner, selector, preview)
            
            targetZoomRatio?.let {
                camera?.cameraControl?.setZoomRatio(it)
            }
            
            emitCapabilities()
            updateCameraControls()
            Log.i(TAG, "CameraX started successfully")
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
                if (fpsRanges != null && fpsRanges.isNotEmpty()) {
                    val bestRange = fpsRanges.maxByOrNull { it.upper }
                    if (bestRange != null) {
                        builder.setTargetFrameRate(bestRange)
                    }
                }
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
                if (now - lastExposureUpdateTime >= 100) {
                    val currentIso = result.get(CaptureResult.SENSOR_SENSITIVITY) ?: return
                    val currentShutter = result.get(CaptureResult.SENSOR_EXPOSURE_TIME) ?: return
                    val currentFocus = result.get(CaptureResult.LENS_FOCUS_DISTANCE) ?: 0.0f
                    val shutterDenominator = 1_000_000_000.0 / currentShutter.toDouble()
                    
                    listener.onExposureUpdate(currentIso, shutterDenominator, currentFocus)
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
                targetZoomRatio = calculatePhysicalZoomRatio(cameraManager, parentLogicalId, cameraId!!)
                builder.addCameraFilter { it.filter { c -> Camera2CameraInfo.from(c).cameraId == parentLogicalId } }
                builder.setPhysicalCameraId(cameraId!!)
            } else {
                builder.addCameraFilter { it.filter { c -> Camera2CameraInfo.from(c).cameraId == parentLogicalId } }
            }
            selectedSelector = builder.build()
        }
        
        return Pair(selectedSelector, targetZoomRatio)
    }

    private fun calculatePhysicalZoomRatio(manager: CameraManager, logicalId: String, physicalId: String): Float? {
        try {
            val physChars = manager.getCameraCharacteristics(physicalId)
            val parentChars = manager.getCameraCharacteristics(logicalId)
            val physFocal = physChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
            val parentFocal = parentChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
            val physSensor = physChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
            val parentSensor = parentChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
            
            if (physFocal != null && parentFocal != null && physSensor != null && parentSensor != null) {
                val physDiag = Math.sqrt(Math.pow(physSensor.width.toDouble(), 2.0) + Math.pow(physSensor.height.toDouble(), 2.0))
                val parentDiag = Math.sqrt(Math.pow(parentSensor.width.toDouble(), 2.0) + Math.pow(parentSensor.height.toDouble(), 2.0))
                val phys35mm = physFocal * (43.27 / physDiag)
                val parent35mm = parentFocal * (43.27 / parentDiag)
                return (phys35mm / parent35mm).toFloat()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error calculating zoom ratio", e)
        }
        return null
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

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, if (whiteBalanceAuto) CaptureRequest.CONTROL_AWB_MODE_AUTO else CaptureRequest.CONTROL_AWB_MODE_OFF)
            
            if (autoFocus) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.LENS_FOCUS_DISTANCE, focusDistance)
            }

            control.captureRequestOptions = builder.build()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update camera controls", e)
        }
    }

    private fun emitCapabilities() {
        val event = Arguments.createMap()
        val camerasList = Arguments.createArray()
        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        
        try {
            val addedIds = mutableSetOf<String>()
            for (id in cameraManager.cameraIdList) {
                val chars = cameraManager.getCameraCharacteristics(id)
                if (chars.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK) {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        val physicalIds = chars.physicalCameraIds
                        if (physicalIds != null && physicalIds.isNotEmpty()) {
                            for (physId in physicalIds) {
                                if (addedIds.add(physId)) addCameraToMap(physId, cameraManager.getCameraCharacteristics(physId), camerasList)
                            }
                            continue
                        }
                    }
                    if (addedIds.add(id)) addCameraToMap(id, chars, camerasList)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get physical cameras", e)
        }
        
        event.putArray("availableCameras", camerasList)
        
        camera?.let {
            val info = Camera2CameraInfo.from(it.cameraInfo)
            val afModes = info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES)
            event.putBoolean("supportsFocus", afModes?.any { m -> m != CameraCharacteristics.CONTROL_AF_MODE_OFF } ?: false)
            info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)?.let { range ->
                event.putInt("isoMin", range.lower)
                event.putInt("isoMax", range.upper)
            }
        }
        
        listener.onCapabilitiesUpdate(event)
    }

    private fun addCameraToMap(id: String, chars: CameraCharacteristics, list: WritableArray) {
        val map = Arguments.createMap()
        map.putString("id", id)
        chars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.let { focalLengths ->
            chars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)?.let { sensorSize ->
                if (focalLengths.isNotEmpty()) {
                    val focalLength = focalLengths[0]
                    map.putDouble("focalLength", focalLength.toDouble())
                    val sensorDiagonal = Math.sqrt(Math.pow(sensorSize.width.toDouble(), 2.0) + Math.pow(sensorSize.height.toDouble(), 2.0))
                    val focalLength35mm = focalLength * (43.27 / sensorDiagonal)
                    map.putInt("focalLength35mm", focalLength35mm.toInt())
                }
            }
        }
        list.pushMap(map)
    }

    fun release() {
        cameraProvider?.unbindAll()
        cameraProvider = null
        camera = null
        currentSurfaceTexture = null
    }
}
