package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.util.Log
import android.view.Surface
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

import android.content.res.AssetManager

class LiveFilmProcessor {
    private val TAG = "LiveFilmProcessor"

    private var nativeEnginePtr: Long = 0L
    private var lastSurface: Surface? = null

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    companion object {
        init {
            try {
                System.loadLibrary("grovkornet-engine")
                Log.i("LiveFilmProcessor", "Successfully loaded native grovkornet-engine library")
            } catch (e: Exception) {
                Log.e("LiveFilmProcessor", "Failed to load engine library", e)
            }
        }
    }

    // Native JNI methods
    private external fun nativePrepare(width: Int, height: Int, assetManager: AssetManager): Long
    private external fun nativeRelease(nativeEnginePtr: Long)
    private external fun nativeUpdateOverlay(nativeEnginePtr: Long, bitmaps: Array<Bitmap>)
    private external fun nativeGetDrsScale(nativeEnginePtr: Long): Float
    private external fun nativeSetStream(nativeEnginePtr: Long, surfaceTexture: SurfaceTexture)
    private external fun nativeUpdateSwapChain(nativeEnginePtr: Long, surface: Surface?)
    private external fun nativeRenderLiveFrame(
        enginePtr: Long,
        params: FloatArray,
        uvMatrixIn: FloatArray,
        cameraWidth: Int,
        cameraHeight: Int,
        viewportWidth: Int,
        viewportHeight: Int,
        outFpsStats: IntArray,
        skipScreenRender: Boolean,
        isNewFrame: Boolean
    ): Boolean
    private external fun nativeSimulateFrameTime(nativeEnginePtr: Long, frameTimeMs: Float)

    fun prepare(surfaceTexture: SurfaceTexture, width: Int, height: Int, assetManager: AssetManager) {
        if (isPrepared && currentWidth == width && currentHeight == height) return

        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing LiveFilmProcessor for ${width}x${height}...")

        try {
            if (isPrepared) release()

            nativeEnginePtr = nativePrepare(width, height, assetManager)
            if (nativeEnginePtr == 0L) {
                throw RuntimeException("nativePrepare returned 0 pointer")
            }

            // Bind the Stream to the Engine's inputTextureExternal
            nativeSetStream(nativeEnginePtr, surfaceTexture)

            currentWidth = width
            currentHeight = height
            isPrepared = true

            Log.i(TAG, "Live native preparation complete in ${System.currentTimeMillis() - startTime}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to prepare LiveFilmProcessor", e)
            isPrepared = false
        }
    }

    fun renderLiveFrame(
        surface: Surface,
        params: CameraConfiguration,
        uvMatrixIn: FloatArray,
        cameraWidth: Int = 0,
        cameraHeight: Int = 0,
        viewportWidth: Int = 0,
        viewportHeight: Int = 0,
        skipScreenRender: Boolean = false,
        isNewFrame: Boolean = true,
        onFpsUpdate: (actualFps: Int, stampedFps: Int) -> Unit = { _, _ -> }
    ) {
        if (!isPrepared || nativeEnginePtr == 0L) {
            Log.w(TAG, "Cannot render live frame: LiveFilmProcessor not prepared")
            return
        }

        try {
            // Re-create SwapChain if the output surface changes
            if (lastSurface != surface) {
                nativeUpdateSwapChain(nativeEnginePtr, surface)
                lastSurface = surface
            }

            val time = (System.currentTimeMillis() % 100000) / 1000f
            
            val targetRes = when(params.resolutionSetting) {
                0 -> 2160
                1 -> 1080
                2 -> 720
                3 -> 480
                4 -> 360
                5 -> 240
                6 -> 144
                else -> 1080
            }
            val floatParams = FloatArray(18).apply {
                this[0] = params.saturation
                this[1] = params.contrast
                this[2] = if (params.grainEnabled) params.grainIntensity else 0.0f
                this[3] = params.grainChroma
                this[4] = params.grainSize
                this[5] = params.vignetteIntensity
                this[6] = params.vhsIntensity
                this[7] = time
                this[8] = params.ev
                this[9] = params.whiteBalance
                this[10] = params.tint
                this[11] = if (params.bloomEnabled) params.bloomIntensity else 0.0f
                this[12] = params.aberration
                this[13] = params.aberrationDirection.toFloat()
                this[14] = params.sharpening
                this[15] = params.targetFps.toFloat()
                this[16] = params.aspectRatio.toFloat()
                this[17] = targetRes.toFloat()
            }

            val outFpsStats = IntArray(3) // [hasNewFps, actualFps, stampedFps]
            val rendered = nativeRenderLiveFrame(
                nativeEnginePtr,
                floatParams,
                uvMatrixIn,
                cameraWidth,
                cameraHeight,
                viewportWidth,
                viewportHeight,
                outFpsStats,
                skipScreenRender,
                isNewFrame
            )

            if (rendered && outFpsStats[0] != 0) {
                onFpsUpdate(outFpsStats[1], outFpsStats[2])
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to render frame", e)
        }
    }

    fun updateOverlay(bitmaps: Array<Bitmap>) {
        if (nativeEnginePtr != 0L) {
            nativeUpdateOverlay(nativeEnginePtr, bitmaps)
        }
    }

    fun getDrsScale(): Float {
        return if (nativeEnginePtr != 0L) nativeGetDrsScale(nativeEnginePtr) else 1.0f
    }

    fun simulateFrameTime(frameTimeMs: Float) {
        if (nativeEnginePtr != 0L) {
            nativeSimulateFrameTime(nativeEnginePtr, frameTimeMs)
        }
    }

    fun release() {
        Log.i(TAG, "Releasing LiveFilmProcessor...")
        if (nativeEnginePtr != 0L) {
            nativeRelease(nativeEnginePtr)
            nativeEnginePtr = 0L
        }

        lastSurface = null
        isPrepared = false
        Log.i(TAG, "LiveFilmProcessor release complete.")
    }
}
