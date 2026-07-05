package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.CaptureResult
import android.hardware.camera2.TotalCaptureResult
import android.util.Log
import android.util.Range
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.CaptureRequestOptions
import androidx.camera.core.Camera
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.BuildConfig
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ProcessLifecycleOwner

class CameraControlManager(
    private val context: Context,
    private val config: CameraConfiguration,
    private val listener: Listener
) {
    private val TAG = "CameraControlManager"
    private var lastExposureUpdateTime = 0L
    private var lastAutoIso = 400
    private var lastAutoShutter = 1000000000L / 60

    private var lastAppliedTargetFps: Int = -1
    private var lastAppliedIsoAuto: Boolean? = null
    private var lastAppliedShutterSpeedAuto: Boolean? = null
    private var lastAppliedEv: Float = Float.NaN
    private var lastAppliedIso: Int = -1
    private var lastAppliedExposureTime: Long = -1L
    private var lastAppliedNoiseReductionAuto: Boolean? = null
    private var lastAppliedNoiseReduction: Int = -1
    private var lastAppliedTemperatureAuto: Boolean? = null
    private var lastAppliedAutoFocus: Boolean? = null
    private var lastAppliedFocusDistance: Float = Float.NaN
    private var lastAppliedTorchEnabled: Boolean? = null
    private var lastAppliedTorchStrength: Int = -1

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int, activeCameraId: String?)
    }

    fun updateControls(camera: Camera, baseZoom: Float = 1.0f) {
        try {
            camera.cameraControl.setZoomRatio(baseZoom * config.zoom)

            val interopChanged = lastAppliedTargetFps != config.targetFps ||
                lastAppliedIsoAuto != config.isoAuto ||
                lastAppliedShutterSpeedAuto != config.shutterSpeedAuto ||
                lastAppliedEv != config.ev ||
                (!config.isoAuto && lastAppliedIso != config.iso) ||
                (!config.shutterSpeedAuto && lastAppliedExposureTime != config.exposureTime) ||
                lastAppliedNoiseReductionAuto != config.noiseReductionAuto ||
                lastAppliedNoiseReduction != config.noiseReduction ||
                lastAppliedTemperatureAuto != config.temperatureAuto ||
                lastAppliedAutoFocus != config.autoFocus ||
                lastAppliedFocusDistance != config.focusDistance ||
                lastAppliedTorchEnabled != config.torchEnabled ||
                lastAppliedTorchStrength != config.torchStrength

            if (!interopChanged) {
                return
            }

            lastAppliedTargetFps = config.targetFps
            lastAppliedIsoAuto = config.isoAuto
            lastAppliedShutterSpeedAuto = config.shutterSpeedAuto
            lastAppliedEv = config.ev
            lastAppliedIso = config.iso
            lastAppliedExposureTime = config.exposureTime
            lastAppliedNoiseReductionAuto = config.noiseReductionAuto
            lastAppliedNoiseReduction = config.noiseReduction
            lastAppliedTemperatureAuto = config.temperatureAuto
            lastAppliedAutoFocus = config.autoFocus
            lastAppliedFocusDistance = config.focusDistance
            lastAppliedTorchEnabled = config.torchEnabled
            lastAppliedTorchStrength = config.torchStrength

            val control = Camera2CameraControl.from(camera.cameraControl)
            val info = Camera2CameraInfo.from(camera.cameraInfo)
            val builder = CaptureRequestOptions.Builder()

            val availableFpsRanges = info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES)
            var bestRange = Range(config.targetFps, config.targetFps)

            if (availableFpsRanges != null) {
                val target = config.targetFps
                // Filter ranges that can at least hit the target FPS
                val capableRanges = availableFpsRanges.filter { it.upper >= target }
                
                if (capableRanges.isNotEmpty()) {
                    // Find the one with the smallest upper bound (closest to target but >= target)
                    // If there's a tie on upper bound, prefer fixed ranges (where lower == upper)
                    bestRange = capableRanges.minWithOrNull(Comparator { a, b ->
                        if (a.upper != b.upper) {
                            a.upper.compareTo(b.upper)
                        } else {
                            val aDiff = a.upper - a.lower
                            val bDiff = b.upper - b.lower
                            aDiff.compareTo(bDiff)
                        }
                    }) ?: capableRanges.first()
                } else {
                    // If no range can hit the target (e.g. phone max is 30, target is 60),
                    // fallback to the absolute maximum supported by the hardware.
                    bestRange = availableFpsRanges.maxByOrNull { it.upper } ?: availableFpsRanges.last()
                }
                if (BuildConfig.DEBUG) {
                    Log.d(TAG, "Selected FPS range: $bestRange for target ${config.targetFps}")
                }
            }

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, bestRange)

            if (config.isoAuto && config.shutterSpeedAuto) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_EXPOSURE_COMPENSATION, config.ev.toInt())
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_OFF)
                
                val isoToApply = if (!config.isoAuto) config.iso else lastAutoIso
                val shutterToApply = if (!config.shutterSpeedAuto) config.exposureTime else lastAutoShutter
                
                var analogIso = isoToApply
                var postRawBoost = 100
                val isoRange = info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)
                val maxAnalogIso = isoRange?.upper ?: 10000

                if (analogIso > maxAnalogIso) {
                    postRawBoost = (analogIso * 100) / maxAnalogIso
                    analogIso = maxAnalogIso
                }

                builder.setCaptureRequestOption(CaptureRequest.SENSOR_SENSITIVITY, analogIso)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                    builder.setCaptureRequestOption(CaptureRequest.CONTROL_POST_RAW_SENSITIVITY_BOOST, postRawBoost)
                }
                
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_EXPOSURE_TIME, shutterToApply)
                
                val target = if (config.targetFps > 0) config.targetFps else 60
                val frameDuration = Math.max(1_000_000_000L / target, shutterToApply)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_FRAME_DURATION, frameDuration)
            }

            if (config.noiseReductionAuto) {
                builder.setCaptureRequestOption(CaptureRequest.NOISE_REDUCTION_MODE, CaptureRequest.NOISE_REDUCTION_MODE_FAST)
            } else if (config.noiseReduction != -1) {
                builder.setCaptureRequestOption(CaptureRequest.NOISE_REDUCTION_MODE, config.noiseReduction)
            }
            builder.setCaptureRequestOption(CaptureRequest.EDGE_MODE, CaptureRequest.EDGE_MODE_OFF)

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, if (config.temperatureAuto) CaptureRequest.CONTROL_AWB_MODE_AUTO else CaptureRequest.CONTROL_AWB_MODE_OFF)

            if (config.autoFocus) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.LENS_FOCUS_DISTANCE, config.focusDistance)
            }

            val hasFlash = camera.cameraInfo.hasFlashUnit()
            val isInForeground = ProcessLifecycleOwner.get().lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED)

            if (hasFlash) {
                // Clear any direct system torch we turned on
                if (isInForeground) {
                    try {
                        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                        for (id in cameraManager.cameraIdList) {
                            val chars = cameraManager.getCameraCharacteristics(id)
                            if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                                cameraManager.setTorchMode(id, false)
                            }
                        }
                    } catch (e: Exception) {
                        // Ignore, it might already be controlled by CameraX or closed
                    }
                }

                if (config.torchEnabled) {
                    camera.cameraControl.enableTorch(true)
                    try {
                        camera.cameraControl.setTorchStrengthLevel(config.torchStrength)
                    } catch (e: Exception) {
                        if (BuildConfig.DEBUG) {
                            Log.w(TAG, "setTorchStrengthLevel failed: ${e.message}")
                        }
                    }
                } else {
                    camera.cameraControl.enableTorch(false)
                }
            } else {
                // Current camera does NOT have a flash.
                // Disable torch via CameraX on current camera
                camera.cameraControl.enableTorch(false)

                if (isInForeground) {
                    // Turn physical torch on/off using CameraManager on the camera ID that does have a flash
                    try {
                        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                        var fallbackCameraId: String? = null
                        for (id in cameraManager.cameraIdList) {
                            val chars = cameraManager.getCameraCharacteristics(id)
                            if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                                fallbackCameraId = id
                                break
                            }
                        }
                        if (fallbackCameraId != null) {
                            val applyTorch = {
                                if (config.torchEnabled) {
                                    if (android.os.Build.VERSION.SDK_INT >= 33 && config.torchStrength > 1) {
                                        try {
                                            cameraManager.turnOnTorchWithStrengthLevel(fallbackCameraId, config.torchStrength)
                                        } catch (e: Exception) {
                                            cameraManager.setTorchMode(fallbackCameraId, true)
                                        }
                                    } else {
                                        cameraManager.setTorchMode(fallbackCameraId, true)
                                    }
                                } else {
                                    cameraManager.setTorchMode(fallbackCameraId, false)
                                }
                            }

                            try {
                                applyTorch()
                            } catch (e: Exception) {
                                Log.w(TAG, "Failed to control system-level torch immediately, will retry")
                            }

                            // Proactively retry after 800ms to allow CameraX to finish closing the previous camera.
                            // We read the latest config.torchEnabled state inside the lambda.
                            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                                try {
                                    applyTorch()
                                } catch (e: Exception) {
                                    Log.e(TAG, "Failed to control system-level torch after delay", e)
                                }
                            }, 800)
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to control system-level torch", e)
                    }
                }
            }

            control.captureRequestOptions = builder.build()
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "Camera controls updated: ISO=${config.iso}, AF=${config.autoFocus}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update camera controls", e)
        }
    }

    fun createCaptureCallback(): CameraCaptureSession.CaptureCallback {
        return object : CameraCaptureSession.CaptureCallback() {
            override fun onCaptureCompleted(session: CameraCaptureSession, request: CaptureRequest, result: TotalCaptureResult) {
                val now = System.currentTimeMillis()
                if (now - lastExposureUpdateTime >= 250) {
                    var currentIso = result.get(CaptureResult.SENSOR_SENSITIVITY) ?: return
                    val currentShutter = result.get(CaptureResult.SENSOR_EXPOSURE_TIME) ?: return
                    
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                        val boost = result.get(CaptureResult.CONTROL_POST_RAW_SENSITIVITY_BOOST)
                        if (boost != null && boost != 100) {
                            currentIso = currentIso * boost / 100
                        }
                    }
                    
                    if (config.isoAuto && config.shutterSpeedAuto) {
                        lastAutoIso = currentIso
                        lastAutoShutter = currentShutter
                    }
                    
                    val currentFocus = result.get(CaptureResult.LENS_FOCUS_DISTANCE) ?: 0.0f
                    val currentNR = result.get(CaptureResult.NOISE_REDUCTION_MODE) ?: 1
                    val shutterDenominator = 1_000_000_000.0 / currentShutter.toDouble()

                    var activeCameraId: String? = null
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        activeCameraId = result.get(CaptureResult.LOGICAL_MULTI_CAMERA_ACTIVE_PHYSICAL_ID)
                    }
                    if (activeCameraId.isNullOrEmpty()) {
                        activeCameraId = config.cameraId
                    }
                    if (activeCameraId.isNullOrEmpty()) {
                        try {
                            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
                            for (id in cameraManager.cameraIdList) {
                                val chars = cameraManager.getCameraCharacteristics(id)
                                if (chars.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK) {
                                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                                        val physicalIds = chars.physicalCameraIds
                                        if (physicalIds != null && physicalIds.isNotEmpty()) {
                                            activeCameraId = physicalIds.firstOrNull()
                                            break
                                        }
                                    }
                                    activeCameraId = id
                                    break
                                }
                            }
                        } catch (e: Exception) {
                            // ignore fallback errors
                        }
                    }

                    listener.onExposureUpdate(currentIso, shutterDenominator, currentFocus, currentNR, activeCameraId)
                    lastExposureUpdateTime = now
                }
            }
        }
    }
}
