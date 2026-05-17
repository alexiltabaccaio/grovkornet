package com.grovkornet.nativefilmcamera.camera

import android.content.Context
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.CaptureResult
import android.hardware.camera2.TotalCaptureResult
import android.util.Log
import android.util.Range
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.CaptureRequestOptions
import androidx.camera.core.Camera
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class CameraControlManager(
    private val context: Context,
    private val config: CameraConfiguration,
    private val listener: Listener
) {
    private val TAG = "CameraControlManager"
    private var lastExposureUpdateTime = 0L
    private var lastAutoIso = 400
    private var lastAutoShutter = 1000000000L / 60

    interface Listener {
        fun onExposureUpdate(iso: Int, shutterSpeed: Double, focusDistance: Float, noiseReduction: Int)
    }

    fun updateControls(camera: Camera) {
        try {
            val control = Camera2CameraControl.from(camera.cameraControl)
            val builder = CaptureRequestOptions.Builder()

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(60, 60))

            if (config.isoAuto && config.shutterSpeedAuto) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_EXPOSURE_COMPENSATION, config.ev.toInt())
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_OFF)
                
                val isoToApply = if (!config.isoAuto) config.iso else lastAutoIso
                val shutterToApply = if (!config.shutterSpeedAuto) config.exposureTime else lastAutoShutter
                
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_SENSITIVITY, isoToApply)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_EXPOSURE_TIME, shutterToApply)
            }

            if (config.noiseReduction != -1) {
                builder.setCaptureRequestOption(CaptureRequest.NOISE_REDUCTION_MODE, config.noiseReduction)
                builder.setCaptureRequestOption(CaptureRequest.EDGE_MODE, config.noiseReduction)
            }

            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, if (config.whiteBalanceAuto) CaptureRequest.CONTROL_AWB_MODE_AUTO else CaptureRequest.CONTROL_AWB_MODE_OFF)

            if (config.autoFocus) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.LENS_FOCUS_DISTANCE, config.focusDistance)
            }

            if (config.torchEnabled) {
                camera.cameraControl.enableTorch(true)
                try {
                    camera.cameraControl.setTorchStrengthLevel(config.torchStrength)
                } catch (e: Exception) {
                    Log.w(TAG, "setTorchStrengthLevel failed: ${e.message}")
                }
            } else {
                camera.cameraControl.enableTorch(false)
            }

            control.captureRequestOptions = builder.build()
            Log.d(TAG, "Camera controls updated: ISO=${config.iso}, AF=${config.autoFocus}")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update camera controls", e)
        }
    }

    fun createCaptureCallback(): CameraCaptureSession.CaptureCallback {
        return object : CameraCaptureSession.CaptureCallback() {
            override fun onCaptureCompleted(session: CameraCaptureSession, request: CaptureRequest, result: TotalCaptureResult) {
                val now = System.currentTimeMillis()
                if (now - lastExposureUpdateTime >= 250) {
                    val currentIso = result.get(CaptureResult.SENSOR_SENSITIVITY) ?: return
                    val currentShutter = result.get(CaptureResult.SENSOR_EXPOSURE_TIME) ?: return
                    
                    if (config.isoAuto && config.shutterSpeedAuto) {
                        lastAutoIso = currentIso
                        lastAutoShutter = currentShutter
                    }
                    
                    val currentFocus = result.get(CaptureResult.LENS_FOCUS_DISTANCE) ?: 0.0f
                    val currentNR = result.get(CaptureResult.NOISE_REDUCTION_MODE) ?: 1
                    val shutterDenominator = 1_000_000_000.0 / currentShutter.toDouble()

                    listener.onExposureUpdate(currentIso, shutterDenominator, currentFocus, currentNR)
                    lastExposureUpdateTime = now
                }
            }
        }
    }
}
