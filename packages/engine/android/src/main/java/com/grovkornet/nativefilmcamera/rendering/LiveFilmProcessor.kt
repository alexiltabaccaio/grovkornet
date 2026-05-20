package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.SurfaceTexture
import android.util.Log
import android.view.Surface
import com.google.android.filament.Engine
import com.google.android.filament.Filament
import com.google.android.filament.Stream
import com.google.android.filament.SwapChain
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class LiveFilmProcessor {
    private val TAG = "LiveFilmProcessor"

    private var nativeEnginePtr: Long = 0L
    private var filamentEngine: Engine? = null
    private var filamentStream: Stream? = null
    private var filamentSwapChain: SwapChain? = null
    private var lastSurface: Surface? = null

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    companion object {
        init {
            try {
                System.loadLibrary("grovkornet-engine")
                Log.i("LiveFilmProcessor", "Successfully loaded native grovkornet-engine library")
                Filament.init()
                Log.i("LiveFilmProcessor", "Successfully initialized Google Filament")
            } catch (e: Exception) {
                Log.e("LiveFilmProcessor", "Failed to load libraries or init Filament", e)
            }
        }
    }

    // Native JNI methods
    private external fun nativePrepare(engineNativePtr: Long, width: Int, height: Int): Long
    private external fun nativeRelease(nativeEnginePtr: Long)
    private external fun nativeUpdateOverlay(nativeEnginePtr: Long, bitmaps: Array<Bitmap>)
    private external fun nativeGetDrsScale(nativeEnginePtr: Long): Float
    private external fun nativeSetStream(nativeEnginePtr: Long, streamNativePtr: Long)
    private external fun nativeRenderLiveFrame(
        nativeEnginePtr: Long,
        swapchainPtr: Long,
        saturation: Float,
        contrast: Float,
        grainIntensity: Float,
        grainChroma: Float,
        grainSize: Float,
        vignetteIntensity: Float,
        vhsIntensity: Float,
        time: Float,
        ev: Float,
        whiteBalance: Float,
        tint: Float,
        bloomIntensity: Float,
        chromaticAberration: Float,
        aberrationDirection: Float,
        uvMatrix: FloatArray
    )
    private external fun nativeSimulateFrameTime(nativeEnginePtr: Long, frameTimeMs: Float)

    fun prepare(surfaceTexture: SurfaceTexture, width: Int, height: Int) {
        if (isPrepared && currentWidth == width && currentHeight == height) return

        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing LiveFilmProcessor for ${width}x${height}...")

        try {
            if (isPrepared) release()

            if (filamentEngine == null) {
                filamentEngine = Engine.create()
            }

            // Create Stream to ingest Camera SurfaceTexture frames
            filamentStream = Stream.Builder()
                .stream(surfaceTexture)
                .build(filamentEngine!!)

            val enginePtr = filamentEngine!!.nativeObject
            nativeEnginePtr = nativePrepare(enginePtr, width, height)
            if (nativeEnginePtr == 0L) {
                throw RuntimeException("nativePrepare returned 0 pointer")
            }

            // Bind the Stream to the Engine's inputTextureExternal
            nativeSetStream(nativeEnginePtr, filamentStream!!.nativeObject)

            currentWidth = width
            currentHeight = height
            isPrepared = true

            Log.i(TAG, "Live native preparation complete in ${System.currentTimeMillis() - startTime}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to prepare LiveFilmProcessor", e)
            isPrepared = false
        }
    }

    fun renderLiveFrame(surface: Surface, params: CameraConfiguration, uvMatrix: FloatArray) {
        if (!isPrepared || nativeEnginePtr == 0L) {
            Log.w(TAG, "Cannot render live frame: LiveFilmProcessor not prepared")
            return
        }

        try {
            // Re-create SwapChain if the output surface changes
            if (filamentSwapChain == null || lastSurface != surface) {
                if (filamentSwapChain != null && filamentEngine != null) {
                    filamentEngine!!.destroySwapChain(filamentSwapChain!!)
                }
                filamentSwapChain = filamentEngine!!.createSwapChain(surface)
                lastSurface = surface
            }

            val time = (System.currentTimeMillis() % 100000) / 1000f
            nativeRenderLiveFrame(
                nativeEnginePtr,
                filamentSwapChain!!.nativeObject,
                params.saturation,
                params.contrast,
                if (params.grainEnabled) params.grainIntensity else 0.0f,
                params.grainChroma,
                params.grainSize,
                params.vignetteIntensity,
                params.vhsIntensity,
                time,
                params.ev,
                params.whiteBalance,
                params.tint,
                if (params.bloomEnabled) params.bloomIntensity else 0.0f,
                params.aberration,
                params.aberrationDirection.toFloat(),
                uvMatrix
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to render live frame", e)
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

        if (filamentSwapChain != null && filamentEngine != null) {
            filamentEngine!!.destroySwapChain(filamentSwapChain!!)
            filamentSwapChain = null
            lastSurface = null
        }

        if (filamentStream != null && filamentEngine != null) {
            filamentEngine!!.destroyStream(filamentStream!!)
            filamentStream = null
        }

        if (filamentEngine != null) {
            filamentEngine!!.destroy()
            filamentEngine = null
        }

        isPrepared = false
        Log.i(TAG, "LiveFilmProcessor release complete.")
    }
}
