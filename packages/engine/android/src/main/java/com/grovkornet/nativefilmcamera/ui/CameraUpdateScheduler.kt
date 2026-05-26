package com.grovkornet.nativefilmcamera.ui

import android.os.Handler
import android.os.Looper
import java.util.concurrent.atomic.AtomicInteger
import com.grovkornet.nativefilmcamera.BuildConfig

class CameraUpdateScheduler(
    private val onUpdateCameraControls: () -> Unit,
    private val postDelayedAction: (Runnable, Long) -> Unit = { r, delay -> Handler(Looper.getMainLooper()).postDelayed(r, delay) },
    private val removeCallbacksAction: (Runnable) -> Unit = { r -> Handler(Looper.getMainLooper()).removeCallbacks(r) },
    private val currentTimeProvider: () -> Long = { System.currentTimeMillis() }
) {
    private var isCameraUpdatePending = false
    private var lastCameraUpdateTime = 0L
    private val hardwareUpdateCount = AtomicInteger(0)

    private val cameraUpdateRunnable = Runnable {
        isCameraUpdatePending = false
        lastCameraUpdateTime = currentTimeProvider()
        onUpdateCameraControls()
        hardwareUpdateCount.incrementAndGet()
    }

    fun schedule() {
        val now = currentTimeProvider()
        val minInterval = 33L

        if (now - lastCameraUpdateTime >= minInterval) {
            if (BuildConfig.DEBUG) {
                android.util.Log.d("CameraUpdateScheduler", "Executing immediate hardware update")
            }
            lastCameraUpdateTime = now
            onUpdateCameraControls()
            hardwareUpdateCount.incrementAndGet()
        } else if (!isCameraUpdatePending) {
            if (BuildConfig.DEBUG) {
                android.util.Log.d("CameraUpdateScheduler", "Scheduling delayed hardware update")
            }
            isCameraUpdatePending = true
            val delay = minInterval - (now - lastCameraUpdateTime)
            postDelayedAction(cameraUpdateRunnable, delay)
        }
    }

    fun getAndResetUpdateCount(): Int {
        return hardwareUpdateCount.getAndSet(0)
    }

    fun release() {
        removeCallbacksAction(cameraUpdateRunnable)
        isCameraUpdatePending = false
    }
}
