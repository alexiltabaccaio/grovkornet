package com.grovkornet.nativefilmcamera.managers

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner

class CameraTorchManager(
    private val getTargetCameraId: () -> String?,
    private val isTorchLogicalEnabled: () -> Boolean,
    private val onTorchStateChanged: (enabled: Boolean) -> Unit,
    private val setTorchModeAction: (cameraId: String, enabled: Boolean) -> Unit,
    private val registerTorchCallbackAction: (callback: CameraManager.TorchCallback) -> Unit,
    private val unregisterTorchCallbackAction: (callback: CameraManager.TorchCallback) -> Unit
) : DefaultLifecycleObserver {

    private val activeSystemTorches = mutableSetOf<String>()
    
    var isTorchOnAtSystemLevel = false
        private set

    val torchCallback = object : CameraManager.TorchCallback() {
        override fun onTorchModeChanged(cameraId: String, enabled: Boolean) {
            if (enabled) {
                activeSystemTorches.add(cameraId)
            } else {
                activeSystemTorches.remove(cameraId)
            }

            val currentCameraId = getTargetCameraId()
            if (cameraId == currentCameraId) {
                isTorchOnAtSystemLevel = enabled
                onTorchStateChanged(enabled)
            }
        }

        override fun onTorchModeUnavailable(cameraId: String) {
            // No-op
        }
    }

    fun initialize() {
        try {
            registerTorchCallbackAction(torchCallback)
        } catch (e: Exception) {
            Log.e("CameraTorchManager", "Failed to register torch callback", e)
        }
    }

    fun unregister() {
        try {
            unregisterTorchCallbackAction(torchCallback)
        } catch (e: Exception) {
            Log.e("CameraTorchManager", "Failed to unregister torch callback", e)
        }
    }

    fun restoreTorchIfLogicalEnabled() {
        if (isTorchLogicalEnabled()) {
            val targetCameraId = getTargetCameraId()
            if (targetCameraId != null) {
                try {
                    setTorchModeAction(targetCameraId, true)
                } catch (e: Exception) {
                    Log.e("CameraTorchManager", "Failed to set torch mode", e)
                }
            }
        }
    }

    override fun onStop(owner: LifecycleOwner) {
        // Do not force the torch back on when the app goes to the background.
        // It conflicts with the system torch state and user expectations.
    }

    companion object {
        fun create(
            context: Context,
            getTargetCameraId: () -> String?,
            isTorchLogicalEnabled: () -> Boolean,
            onTorchStateChanged: (enabled: Boolean) -> Unit
        ): CameraTorchManager {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
            return CameraTorchManager(
                getTargetCameraId = getTargetCameraId,
                isTorchLogicalEnabled = isTorchLogicalEnabled,
                onTorchStateChanged = onTorchStateChanged,
                setTorchModeAction = { cameraId, enabled ->
                    cameraManager?.setTorchMode(cameraId, enabled)
                },
                registerTorchCallbackAction = { callback ->
                    cameraManager?.registerTorchCallback(callback, Handler(Looper.getMainLooper()))
                },
                unregisterTorchCallbackAction = { callback ->
                    cameraManager?.unregisterTorchCallback(callback)
                }
            )
        }

        fun getBackCameraIdFallback(context: Context): String? {
            try {
                val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager ?: return null
                for (id in cameraManager.cameraIdList) {
                    val chars = cameraManager.getCameraCharacteristics(id)
                    val facing = chars.get(CameraCharacteristics.LENS_FACING)
                    if (facing == CameraCharacteristics.LENS_FACING_BACK) {
                        return id
                    }
                }
            } catch (e: Exception) {
                Log.e("CameraTorchManager", "Failed to get fallback back camera ID", e)
            }
            return null
        }

        fun getCameraIdWithFlash(context: Context, preferredId: String?): String? {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager ?: return null
            try {
                if (preferredId != null) {
                    val chars = cameraManager.getCameraCharacteristics(preferredId)
                    if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                        return preferredId
                    }
                }
                for (id in cameraManager.cameraIdList) {
                    val chars = cameraManager.getCameraCharacteristics(id)
                    if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true) {
                        return id
                    }
                }
            } catch (e: Exception) {
                Log.e("CameraTorchManager", "Failed to find camera ID with flash", e)
            }
            return null
        }
    }
}
