package com.grovkornet.nativefilmcamera.managers

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.PowerManager
import android.util.Log
import androidx.core.content.ContextCompat

class DeviceHealthManager(
    private val context: Context,
    private val onDeviceHealthUpdate: (thermalState: String, isLowRam: Boolean) -> Unit,
    // Dependency injection to make unit tests simple
    private val getPowerManager: () -> PowerManager? = {
        context.getSystemService(Context.POWER_SERVICE) as? PowerManager
    },
    private val getActivityManager: () -> ActivityManager? = {
        context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
    },
    private val getMainExecutor: () -> java.util.concurrent.Executor = {
        ContextCompat.getMainExecutor(context)
    }
) {
    private val TAG = "DeviceHealthManager"
    private var isRegistered = false

    private val thermalListener: PowerManager.OnThermalStatusChangedListener? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        PowerManager.OnThermalStatusChangedListener { status ->
            val thermalState = mapThermalStatus(status)
            val isLowRam = checkIsLowRam()
            onDeviceHealthUpdate(thermalState, isLowRam)
        }
    } else {
        null
    }

    fun register() {
        if (isRegistered) return
        isRegistered = true
        
        val isLowRam = checkIsLowRam()
        var initialThermalState = "normal"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val powerManager = getPowerManager()
                if (powerManager != null && thermalListener != null) {
                    val executor = getMainExecutor()
                    powerManager.addThermalStatusListener(
                        executor,
                        thermalListener
                    )
                    initialThermalState = mapThermalStatus(powerManager.currentThermalStatus)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to register thermal status listener", e)
            }
        }
        
        onDeviceHealthUpdate(initialThermalState, isLowRam)
    }

    fun unregister() {
        if (!isRegistered) return
        isRegistered = false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val powerManager = getPowerManager()
                if (powerManager != null && thermalListener != null) {
                    powerManager.removeThermalStatusListener(thermalListener)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to unregister thermal status listener", e)
            }
        }
    }

    private fun checkIsLowRam(): Boolean {
        val activityManager = getActivityManager()
        return activityManager?.isLowRamDevice ?: false
    }

    private fun mapThermalStatus(status: Int): String {
        return when (status) {
            PowerManager.THERMAL_STATUS_NONE,
            PowerManager.THERMAL_STATUS_LIGHT,
            PowerManager.THERMAL_STATUS_MODERATE -> "normal"
            PowerManager.THERMAL_STATUS_SEVERE -> "warning"
            PowerManager.THERMAL_STATUS_CRITICAL,
            PowerManager.THERMAL_STATUS_EMERGENCY,
            PowerManager.THERMAL_STATUS_SHUTDOWN -> "critical"
            else -> "normal"
        }
    }
}
