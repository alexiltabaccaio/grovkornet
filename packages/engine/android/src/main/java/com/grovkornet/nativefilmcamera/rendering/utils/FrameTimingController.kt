package com.grovkornet.nativefilmcamera.rendering.utils

class FrameTimingController {
    private var lastUpdateTime = 0L
    private var timeAccumulator = 0L

    private var framesCount = 0
    private var fboFramesCount = 0
    private var lastLogTime = 0L

    /**
     * Decides if the frame should be captured based on target FPS and updates internal state.
     */
    fun shouldCaptureFrame(targetFps: Int): Boolean {
        val now = System.currentTimeMillis()
        if (lastUpdateTime == 0L) lastUpdateTime = now
        val dt = now - lastUpdateTime
        lastUpdateTime = now

        val target = if (targetFps > 0) targetFps else 60
        val interval = 1000L / target
        timeAccumulator += dt

        var shouldCapture = false
        if (timeAccumulator >= interval - 3) {
            shouldCapture = true
            // If we lagged severely (e.g. paused app), don't burst capture
            if (timeAccumulator > interval * 3) {
                timeAccumulator = 0
            } else {
                timeAccumulator -= interval
            }
        }

        if (shouldCapture) {
            fboFramesCount++
        }

        return shouldCapture
    }

    /**
     * Increments the overall frame counter (HW frames) and updates the FPS statistics if the interval has passed.
     */
    fun updateFps(onFpsUpdate: (fps: Int, stampedFps: Int) -> Unit) {
        val now = System.currentTimeMillis()
        if (lastLogTime == 0L) lastLogTime = now
        framesCount++
        if (now - lastLogTime >= 500) {
            val elapsed = now - lastLogTime
            val actualFps = (framesCount * 1000) / elapsed
            val actualStampedFps = (fboFramesCount * 1000) / elapsed
            onFpsUpdate(actualFps.toInt(), actualStampedFps.toInt())
            lastLogTime = now
            framesCount = 0
            fboFramesCount = 0
        }
    }

    fun reset() {
        lastUpdateTime = 0L
        timeAccumulator = 0L
        framesCount = 0
        fboFramesCount = 0
        lastLogTime = 0L
    }
}
