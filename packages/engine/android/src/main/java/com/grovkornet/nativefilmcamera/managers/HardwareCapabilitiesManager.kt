package com.grovkornet.nativefilmcamera.managers

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Build
import android.util.Log
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.core.Camera
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.grovkornet.nativefilmcamera.logic.CameraLogicUtils

class HardwareCapabilitiesManager(private val context: Context) {
    private val TAG = "HardwareCapabilitiesManager"

    fun getAvailableCameras(): WritableArray {
        val camerasList = Arguments.createArray()
        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        
        try {
            val addedIds = mutableSetOf<String>()
            for (id in cameraManager.cameraIdList) {
                val chars = cameraManager.getCameraCharacteristics(id)
                if (chars.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        val physicalIds = chars.physicalCameraIds
                        if (physicalIds != null && physicalIds.isNotEmpty()) {
                            for (physId in physicalIds) {
                                if (addedIds.add(physId)) {
                                    addCameraToMap(physId, cameraManager.getCameraCharacteristics(physId), camerasList)
                                }
                            }
                            continue
                        }
                    }
                    if (addedIds.add(id)) {
                        addCameraToMap(id, chars, camerasList)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get physical cameras", e)
        }
        return camerasList
    }

    private fun addCameraToMap(id: String, chars: CameraCharacteristics, list: WritableArray) {
        val map = Arguments.createMap()
        map.putString("id", id)
        chars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.let { focalLengths ->
            chars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)?.let { sensorSize ->
                if (focalLengths.isNotEmpty()) {
                    val focalLength = focalLengths[0]
                    map.putDouble("focalLength", focalLength.toDouble())
                    val focalLength35mm = CameraLogicUtils.calculateEquivalentFocalLength(
                        focalLength, 
                        sensorSize.width.toDouble(), 
                        sensorSize.height.toDouble()
                    )
                    map.putInt("focalLength35mm", focalLength35mm.toInt())
                }
            }
        }
        list.pushMap(map)
    }

    fun populateCapabilities(event: WritableMap, camera: Camera?) {
        event.putArray("availableCameras", getAvailableCameras())
        
        camera?.let {
            val info = Camera2CameraInfo.from(it.cameraInfo)
            
            // Focus support
            val afModes = info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES)
            event.putBoolean("supportsFocus", afModes?.any { m -> m != CameraCharacteristics.CONTROL_AF_MODE_OFF } ?: false)
            
            // Torch support
            var deviceHasTorch = false
            var maxTorchStrength = 1
            try {
                val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                for (id in cameraManager.cameraIdList) {
                    val chars = cameraManager.getCameraCharacteristics(id)
                    if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                        deviceHasTorch = true
                        if (Build.VERSION.SDK_INT >= 33) {
                            maxTorchStrength = chars.get(CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL) ?: 1
                        }
                        break
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to query torch capabilities globally", e)
                // Fallback to active camera info
                deviceHasTorch = it.cameraInfo.hasFlashUnit()
                if (deviceHasTorch && Build.VERSION.SDK_INT >= 33) {
                    maxTorchStrength = info.getCameraCharacteristic(CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL) ?: 1
                }
            }
            event.putBoolean("hasTorch", deviceHasTorch)
            event.putInt("maxTorchStrength", maxTorchStrength)

            // ISO range
            info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)?.let { range ->
                event.putInt("isoMin", range.lower)
                event.putInt("isoMax", range.upper)
            }

            // Zoom range
            it.cameraInfo.zoomState.value?.let { zoomState ->
                event.putDouble("minZoom", zoomState.minZoomRatio.toDouble())
                event.putDouble("maxZoom", zoomState.maxZoomRatio.toDouble())
            }


            // Noise Reduction Modes
            info.getCameraCharacteristic(CameraCharacteristics.NOISE_REDUCTION_AVAILABLE_NOISE_REDUCTION_MODES)?.let { modes ->
                val modesArray = Arguments.createArray()
                for (mode in modes) modesArray.pushInt(mode)
                event.putArray("availableNoiseReductionModes", modesArray)
            }

            // Edge Modes
            info.getCameraCharacteristic(CameraCharacteristics.EDGE_AVAILABLE_EDGE_MODES)?.let { modes ->
                val modesArray = Arguments.createArray()
                for (mode in modes) modesArray.pushInt(mode)
                event.putArray("availableEdgeModes", modesArray)
            }

            // Max FPS
            info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES)?.let { ranges ->
                var maxFps = 30
                for (range in ranges) {
                    if (range.upper > maxFps) maxFps = range.upper
                }
                event.putInt("maxFps", maxFps)
            }

            // Max Resolution Width
            info.getCameraCharacteristic(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)?.let { map ->
                val sizes = map.getOutputSizes(android.graphics.SurfaceTexture::class.java)
                if (sizes != null && sizes.isNotEmpty()) {
                    var maxWidth = 0
                    for (sz in sizes) {
                        if (sz.width > maxWidth) {
                            maxWidth = sz.width
                        }
                    }
                    if (maxWidth > 0) {
                        event.putInt("maxResolutionWidth", maxWidth)
                    }
                }
            }
        }
    }
}
