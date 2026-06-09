package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.util.Log
import com.grovkornet.nativefilmcamera.BuildConfig
import android.view.Surface
import com.grovkornet.nativefilmcamera.errors.CameraCodedException
import com.grovkornet.nativefilmcamera.errors.CameraErrorFactory
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
    private val outFpsStats = IntArray(3)

    private var lastConfigHash: Int = 0
    private var cachedFloatParams: FloatArray? = null

    companion object {
        init {
            try {
                System.loadLibrary("grovkornet_engine")
                if (BuildConfig.DEBUG) {
                    Log.i("LiveFilmProcessor", "Successfully loaded native grovkornet_engine library")
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
                throw CameraErrorFactory.createFilamentInitFailed("nativePrepare returned 0 pointer")
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
            if (e is CameraCodedException) throw e
            throw CameraErrorFactory.createFilamentInitFailed("Failed to prepare LiveFilmProcessor: ${e.message}", e)
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
            
            val currentHash = params.hashCode()
            var floatParams = cachedFloatParams
            if (floatParams == null || currentHash != lastConfigHash) {
                floatParams = params.toRenderParamsArray(time, params.getTargetResolutionValue())
                cachedFloatParams = floatParams
                lastConfigHash = currentHash
            } else {
                // Config hasn't changed, reuse the array and just update the time uniform (index 8)
                floatParams[8] = time
            }

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
            if (e is CameraCodedException) throw e
            throw CameraErrorFactory.createPipelineInitFailed("Failed to render frame: ${e.message}", e)
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
