package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.util.Log
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import com.google.android.filament.Filament

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private var nativeEnginePtr: Long = 0L
    private var filamentEngine: com.google.android.filament.Engine? = null
    private val processMutex = Mutex()

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    companion object {
        init {
            try {
                System.loadLibrary("grovkornet-engine")
                Log.i("OffscreenProcessor", "Successfully loaded native grovkornet-engine library")
                Filament.init()
                Log.i("OffscreenProcessor", "Successfully initialized Google Filament")
            } catch (e: Exception) {
                Log.e("OffscreenProcessor", "Failed to load libraries or init Filament", e)
            }
        }
    }

    // Native JNI methods
    private external fun nativePrepare(engineNativePtr: Long, width: Int, height: Int): Long
    private external fun nativeProcessBitmap(
        nativeEnginePtr: Long,
        input: Bitmap,
        output: Bitmap,
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
        sharpening: Float
    )
    private external fun nativeProcessHardwareBuffer(
        nativeEnginePtr: Long,
        hardwareBuffer: android.hardware.HardwareBuffer,
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
        sharpening: Float
    )
    private external fun nativeUpdateOverlay(
        nativeEnginePtr: Long,
        bitmaps: Array<Bitmap>
    )
    private external fun nativeRelease(nativeEnginePtr: Long)
    private external fun nativeGetDrsScale(nativeEnginePtr: Long): Float
    private external fun nativeSimulateFrameTime(nativeEnginePtr: Long, frameTimeMs: Float)

    fun prepare(width: Int, height: Int) {
        if (isPrepared && currentWidth == width && currentHeight == height) return
        
        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing native Filament engine for ${width}x${height}...")

        try {
            if (isPrepared) release()

            if (filamentEngine == null) {
                filamentEngine = com.google.android.filament.Engine.create()
            }
            val enginePtr = filamentEngine!!.nativeObject

            nativeEnginePtr = nativePrepare(enginePtr, width, height)
            if (nativeEnginePtr == 0L) {
                throw RuntimeException("nativePrepare returned 0 pointer")
            }

            currentWidth = width
            currentHeight = height
            isPrepared = true
            
            Log.i(TAG, "Native preparation complete in ${System.currentTimeMillis() - startTime}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to prepare OffscreenProcessor with Filament", e)
            isPrepared = false
        }
    }

    suspend fun process(input: Bitmap, params: CameraConfiguration): Bitmap = processMutex.withLock {
        if (!isPrepared) {
            Log.w(TAG, "Processor not prepared, preparing now (this will cause lag)...")
            prepare(input.width, input.height)
        }
        
        // If resolution changed, we need to re-prepare
        if (input.width != currentWidth || input.height != currentHeight) {
            Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${input.width}x${input.height}. Re-preparing...")
            prepare(input.width, input.height)
        }

        if (nativeEnginePtr == 0L) {
            Log.e(TAG, "Native engine pointer is null, returning original bitmap")
            return input
        }

        val startTime = System.currentTimeMillis()
        val width = input.width
        val height = input.height

        try {
            val outputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val time = (System.currentTimeMillis() % 100000) / 1000f
            
            // Process pixels in C++
            nativeProcessBitmap(
                nativeEnginePtr,
                input,
                outputBitmap,
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
                params.sharpening
            )

            // FIX: Filament reads pixels with a bottom-left origin, so the resulting bitmap is upside down.
            // We must vertically flip the bitmap to match Android's top-left coordinate system.
            val flipMatrix = android.graphics.Matrix().apply { postScale(1f, -1f) }
            val flippedBitmap = Bitmap.createBitmap(outputBitmap, 0, 0, width, height, flipMatrix, true)
            outputBitmap.recycle()

            Log.i(TAG, "Frame processed natively in ${System.currentTimeMillis() - startTime}ms")
            return flippedBitmap
        } catch (e: Exception) {
            Log.e(TAG, "Offscreen native processing failed", e)
            return input
        }
    }

    suspend fun processHardwareBuffer(
        hardwareBuffer: android.hardware.HardwareBuffer,
        params: CameraConfiguration
    ) {
        processMutex.withLock {
            if (!isPrepared) {
                Log.w(TAG, "Processor not prepared, preparing now...")
                prepare(hardwareBuffer.width, hardwareBuffer.height)
            }

            if (hardwareBuffer.width != currentWidth || hardwareBuffer.height != currentHeight) {
                Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${hardwareBuffer.width}x${hardwareBuffer.height}. Re-preparing...")
                prepare(hardwareBuffer.width, hardwareBuffer.height)
            }

            if (nativeEnginePtr == 0L) {
                Log.e(TAG, "Native engine pointer is null, skipping hardware buffer processing")
                return@withLock
            }

            val startTime = System.currentTimeMillis()
            val time = (System.currentTimeMillis() % 100000) / 1000f
            try {
                nativeProcessHardwareBuffer(
                    nativeEnginePtr,
                    hardwareBuffer,
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
                    params.sharpening
                )
                Log.i(TAG, "HardwareBuffer processed natively (zero-copy) in ${System.currentTimeMillis() - startTime}ms")
            } catch (e: Exception) {
                Log.e(TAG, "Offscreen native HardwareBuffer processing failed", e)
            }
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
        if (!isPrepared) return
        
        Log.i(TAG, "Releasing native Filament engine...")
        if (nativeEnginePtr != 0L) {
            nativeRelease(nativeEnginePtr)
            nativeEnginePtr = 0L
        }

        if (filamentEngine != null) {
            filamentEngine!!.destroy()
            filamentEngine = null
        }
        
        isPrepared = false
        Log.i(TAG, "Release complete.")
    }
}
