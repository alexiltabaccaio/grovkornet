package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.util.Log
import com.grovkornet.nativefilmcamera.BuildConfig
import android.view.Surface
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.state.getTargetResolutionValue
import com.grovkornet.nativefilmcamera.state.toRenderParamsArray

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
                if (BuildConfig.DEBUG) {
                    Log.i("LiveFilmProcessor", "Successfully loaded native grovkornet-engine library")
                }
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
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Preparing LiveFilmProcessor for ${width}x${height}...")
        }

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

            if (BuildConfig.DEBUG) {
                Log.i(TAG, "Live native preparation complete in ${System.currentTimeMillis() - startTime}ms")
            }
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
            if (BuildConfig.DEBUG) {
                Log.w(TAG, "Cannot render live frame: LiveFilmProcessor not prepared")
            }
            return
        }

        try {
            // Re-create SwapChain if the output surface changes
            if (lastSurface != surface) {
                nativeUpdateSwapChain(nativeEnginePtr, surface)
                lastSurface = surface
            }

            val time = ((System.currentTimeMillis() / 1000.0) % (Math.PI * 2.0)).toFloat()
            
            val floatParams = params.toRenderParamsArray(time, params.getTargetResolutionValue())

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
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Releasing LiveFilmProcessor...")
        }
        if (nativeEnginePtr != 0L) {
            nativeRelease(nativeEnginePtr)
            nativeEnginePtr = 0L
        }

        lastSurface = null
        isPrepared = false
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "LiveFilmProcessor release complete.")
        }
    }
}
