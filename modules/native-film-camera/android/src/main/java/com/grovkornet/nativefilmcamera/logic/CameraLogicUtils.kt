package com.grovkornet.nativefilmcamera.logic

import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Log

object CameraLogicUtils {
    private const val TAG = "CameraLogicUtils"
    private const val DIAGONAL_35MM = 43.27

    /**
     * Calculates the zoom ratio for a physical camera relative to its logical parent.
     */
    fun calculatePhysicalZoomRatio(manager: CameraManager, logicalId: String, physicalId: String): Float? {
        try {
            val physChars = manager.getCameraCharacteristics(physicalId)
            val parentChars = manager.getCameraCharacteristics(logicalId)
            
            val physFocal = physChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
            val parentFocal = parentChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
            
            val physSensor = physChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
            val parentSensor = parentChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
            
            if (physFocal != null && parentFocal != null && physSensor != null && parentSensor != null) {
                val phys35mm = calculateEquivalentFocalLength(physFocal, physSensor.width.toDouble(), physSensor.height.toDouble())
                val parent35mm = calculateEquivalentFocalLength(parentFocal, parentSensor.width.toDouble(), parentSensor.height.toDouble())
                return (phys35mm / parent35mm).toFloat()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error calculating zoom ratio", e)
        }
        return null
    }

    /**
     * Calculates 35mm equivalent focal length based on sensor size.
     */
    fun calculateEquivalentFocalLength(focalLength: Float, sensorWidth: Double, sensorHeight: Double): Double {
        val sensorDiagonal = Math.sqrt(Math.pow(sensorWidth, 2.0) + Math.pow(sensorHeight, 2.0))
        return focalLength * (DIAGONAL_35MM / sensorDiagonal)
    }
}
