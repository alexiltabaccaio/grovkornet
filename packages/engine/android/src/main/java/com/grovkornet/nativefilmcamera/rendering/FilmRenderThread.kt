package com.grovkornet.nativefilmcamera.rendering

import android.graphics.SurfaceTexture
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.view.Choreographer
import android.view.Surface
import com.grovkornet.nativefilmcamera.rendering.utils.FrameTimingController
import com.grovkornet.nativefilmcamera.rendering.utils.MatrixTransformCalculator
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import java.util.concurrent.atomic.AtomicBoolean

class FilmRenderThread(
    private val surfaceProvider: () -> Surface?,
    private val onSurfaceTextureReady: (SurfaceTexture) -> Unit,
    private val onDebugUpdate: (Map<String, Any>) -> Unit
) : HandlerThread("FilmRenderThread") {

    private val TAG = "FilmRenderThread"

    val handler by lazy { Handler(looper) }
    private var choreographer: Choreographer? = null
    private var liveProcessor: LiveFilmProcessor? = null
    private var surfaceTexture: SurfaceTexture? = null

    private val timingController = FrameTimingController()
    private val matrixCalculator = MatrixTransformCalculator()

    @Volatile private var renderConfig = CameraConfiguration()
    @Volatile private var width = 0
    @Volatile private var height = 0
    @Volatile private var cameraWidth = 0
    @Volatile private var cameraHeight = 0

    private val isFrameAvailable = AtomicBoolean(false)
    private val isReleased = AtomicBoolean(false)

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
    }

    fun updateConfig(config: CameraConfiguration) {
        renderConfig = config.copy()
    }

    fun updateDimensions(w: Int, h: Int) {
        width = w
        height = h
        handler.post {
            setupProcessorIfNeeded()
        }
    }

    fun updateCameraResolution(w: Int, h: Int) {
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
                }, handler)
            }
            onSurfaceTextureReady(surfaceTexture!!)
        }

        liveProcessor?.prepare(surfaceTexture!!, w, h)
    }

    private fun drawLiveFrame() {
        val st = surfaceTexture ?: return
        val surface = surfaceProvider() ?: return
        if (!surface.isValid) return

        try {
            if (isFrameAvailable.get()) {
                isFrameAvailable.set(false)
            }

            val currentConfig = renderConfig

            timingController.updateFps { fps, stampedFps ->
                if (!isReleased.get()) {
                    onDebugUpdate(mapOf(
                        "fps" to stampedFps,
                        "resolution" to "${cameraWidth}x${cameraHeight}",
                        "hwFps" to fps
                    ))
                }
            }

            val shouldCapture = timingController.shouldCaptureFrame(currentConfig.targetFps)
            if (shouldCapture) {
                val matrix = FloatArray(16)
                st.getTransformMatrix(matrix)

                val scaleMatrix = FloatArray(16)
                val cropMatrix = FloatArray(16)

                matrixCalculator.calculateScaleAndCrop(
                    cameraWidth, cameraHeight, width, height, currentConfig.aspectRatio, scaleMatrix, cropMatrix
                )

                val finalUvMatrix = FloatArray(16)
                android.opengl.Matrix.multiplyMM(finalUvMatrix, 0, matrix, 0, cropMatrix, 0)

                val scaleX = scaleMatrix[0]
                val scaleY = scaleMatrix[5]
                val vpWidth = (width * scaleX).toInt()
                val vpHeight = (height * scaleY).toInt()
                val vpX = (width - vpWidth) / 2
                val vpY = (height - vpHeight) / 2

                liveProcessor?.renderLiveFrame(surface, currentConfig, finalUvMatrix, vpX, vpY, vpWidth, vpHeight)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error drawing live frame in background", e)
        }
    }

    fun release() {
        if (isReleased.getAndSet(true)) return
        Log.i(TAG, "Releasing FilmRenderThread...")

        handler.post {
            choreographer?.removeFrameCallback(frameCallback)
            liveProcessor?.release()
            liveProcessor = null
            surfaceTexture?.release()
            surfaceTexture = null
            quitSafely()
        }
    }
}
