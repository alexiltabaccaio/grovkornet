package com.grovkornet.nativefilmcamera.rendering

import android.content.res.AssetManager
import android.graphics.SurfaceTexture
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.view.Choreographer
import android.view.Surface
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.BuildConfig
import com.grovkornet.nativefilmcamera.events.CameraEvents
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

open class FilmRenderThread(
    private val assetManager: AssetManager,
    private val surfaceProvider: () -> Surface?,
    private val onSurfaceTextureReady: (SurfaceTexture) -> Unit,
    private val onDebugUpdate: (Map<String, Any>) -> Unit,
    private val onCameraFreezeDetected: () -> Unit
) : HandlerThread("FilmRenderThread") {

    private val TAG = "FilmRenderThread"

    val handler by lazy { Handler(looper) }
    private var choreographer: Choreographer? = null
    private var liveProcessor: LiveFilmProcessor? = null
    private var surfaceTexture: SurfaceTexture? = null
    private val transformMatrix = FloatArray(16)

    @Volatile private var renderConfig = CameraConfiguration()
    @Volatile private var width = 0
    @Volatile private var height = 0
    @Volatile private var cameraWidth = 0
    @Volatile private var cameraHeight = 0

    @Volatile private var hardwareChangeTime = 0L
    @Volatile private var isTransitioningCamera = false
    @Volatile private var lastFrameTimestamp = 0L
    private val lastFrameReceivedTimeMs = AtomicLong(System.currentTimeMillis())

    open fun notifyHardwareChange() {
        hardwareChangeTime = System.currentTimeMillis()
        isTransitioningCamera = true
        lastFrameReceivedTimeMs.set(System.currentTimeMillis())
    }

    private val watchdogRunnable = object : Runnable {
        override fun run() {
            if (isReleased.get()) return
            val now = System.currentTimeMillis()
            val lastFrame = lastFrameReceivedTimeMs.get()
            if (!isTransitioningCamera && (now - lastFrame > 3000)) {
                Log.w(TAG, "Camera freeze detected! No frame for ${now - lastFrame}ms")
                // Reset lastFrameReceivedTimeMs so we don't trigger repeatedly while recovering
                lastFrameReceivedTimeMs.set(now)
                android.os.Handler(android.os.Looper.getMainLooper()).post {
                    onCameraFreezeDetected()
                }
            }
            handler.postDelayed(this, 1000)
        }
    }

    private val isFrameAvailable = AtomicBoolean(false)
    private val isReleased = AtomicBoolean(false)
    
    private var framesProcessed = 0

    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (isReleased.get()) return

            drawLiveFrame()

            try {
                choreographer?.postFrameCallback(this)
            } catch (e: Exception) {
                Log.e(TAG, "Error posting choreographer frame callback", e)
            }
        }
    }

    override fun onLooperPrepared() {
        choreographer = Choreographer.getInstance()
        choreographer?.postFrameCallback(frameCallback)
        handler.post(watchdogRunnable)
    }

    open fun updateConfig(config: CameraConfiguration) {
        renderConfig = config
    }

    open fun updateDimensions(w: Int, h: Int) {
        width = w
        height = h
        handler.post {
            setupProcessorIfNeeded()
        }
    }

    open fun updateCameraResolution(w: Int, h: Int) {
        cameraWidth = w
        cameraHeight = h
    }

    private fun setupProcessorIfNeeded() {
        val w = width
        val h = height
        if (w <= 0 || h <= 0 || isReleased.get()) return

        if (liveProcessor == null) {
            liveProcessor = LiveFilmProcessor()
        }

        if (surfaceTexture == null) {
            surfaceTexture = SurfaceTexture(0).apply {
                setDefaultBufferSize(w, h)
                setOnFrameAvailableListener({
                    isFrameAvailable.set(true)
                    lastFrameReceivedTimeMs.set(System.currentTimeMillis())
                }, handler)
            }
            onSurfaceTextureReady(surfaceTexture!!)
        }
        try {
            liveProcessor?.prepare(surfaceTexture!!, w, h, assetManager)
        } catch (e: Exception) {
            Log.e(TAG, "Fatal: Failed to prepare LiveFilmProcessor inside setupProcessorIfNeeded", e)
        }
    }

    private var lastDebugUpdateTime = 0L

    private fun drawLiveFrame() {
        val st = surfaceTexture ?: return
        val surface = surfaceProvider() ?: return
        if (!surface.isValid) return

        try {
            val renderStartTime = if (BuildConfig.DEBUG) System.currentTimeMillis() else 0L

            val wasFrameAvailable = isFrameAvailable.getAndSet(false)
            val nowMs = System.currentTimeMillis()

            if (isTransitioningCamera && (nowMs - hardwareChangeTime > 2500)) {
                // Fallback timeout
                isTransitioningCamera = false
                framesProcessed = 0
            }

            if (!isTransitioningCamera && wasFrameAvailable) {
                framesProcessed++
            }



            val currentConfig = renderConfig
            st.getTransformMatrix(transformMatrix)

            liveProcessor?.renderLiveFrame(
                surface,
                currentConfig,
                transformMatrix,
                cameraWidth,
                cameraHeight,
                width,
                height,
                framesProcessed < 5 || isTransitioningCamera,
                wasFrameAvailable
            ) { actualFps, stampedFps ->
                if (!isReleased.get()) {
                    val now = System.currentTimeMillis()
                    if (now - lastDebugUpdateTime >= 500) {
                        onDebugUpdate(CameraEvents.createOnDebugUpdate(
                            fps = stampedFps.toDouble(),
                            hwFps = actualFps.toDouble(),
                            resolution = "${cameraWidth}x${cameraHeight}",
                            timestamp = now.toDouble()
                        ))
                        lastDebugUpdateTime = now
                    }
                }
            }

            val newTimestamp = st.timestamp
            if (newTimestamp != lastFrameTimestamp && lastFrameTimestamp != 0L) {
                val gap = newTimestamp - lastFrameTimestamp
                if (isTransitioningCamera && gap > 150_000_000L) {
                    if (BuildConfig.DEBUG) {
                        Log.d(TAG, "Camera transition complete. Gap: ${gap / 1_000_000}ms")
                    }
                    isTransitioningCamera = false
                    framesProcessed = 0
                }
            }
            lastFrameTimestamp = newTimestamp

            if (BuildConfig.DEBUG) {
                val renderDuration = System.currentTimeMillis() - renderStartTime
                if (renderDuration > 17) {
                    Log.w(TAG, "Frame drop! Rendering took ${renderDuration}ms")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error drawing live frame in background", e)
        }
    }

    open fun release() {
        if (isReleased.getAndSet(true)) return
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Releasing FilmRenderThread...")
        }

        val latch = java.util.concurrent.CountDownLatch(1)
        handler.post {
            try {
                handler.removeCallbacks(watchdogRunnable)
                choreographer?.removeFrameCallback(frameCallback)
                liveProcessor?.release()
                liveProcessor = null
                surfaceTexture?.release()
                surfaceTexture = null
            } finally {
                latch.countDown()
                quitSafely()
            }
        }

        try {
            // Block up to 1500ms to ensure Filament finishes using the Surface
            // before Android destroys the underlying native window.
            if (!latch.await(1500, java.util.concurrent.TimeUnit.MILLISECONDS)) {
                Log.w(TAG, "Timeout waiting for FilmRenderThread to release")
            }
        } catch (e: InterruptedException) {
            Log.e(TAG, "Interrupted while waiting for release", e)
        }
    }

    open override fun start() {
        super.start()
    }

    open override fun getLooper(): android.os.Looper {
        return super.getLooper() ?: android.os.Looper.getMainLooper()
    }
}
