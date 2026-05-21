package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.util.Log
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private var nativeEnginePtr: Long = 0L
    private val processMutex = Mutex()

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    companion object {
        init {
            try {
                System.loadLibrary("grovkornet-engine")
                Log.i("OffscreenProcessor", "Successfully loaded native grovkornet-engine library")
            } catch (e: Exception) {
                Log.e("OffscreenProcessor", "Failed to load engine library", e)
            }
        }
    }

    // Native JNI methods
    private external fun nativePrepare(width: Int, height: Int, assetManager: android.content.res.AssetManager): Long
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
        params: FloatArray
    )
    private external fun nativeUpdateOverlay(
        nativeEnginePtr: Long,
        bitmaps: Array<Bitmap>
    )
    private external fun nativeRelease(nativeEnginePtr: Long)
    private external fun nativeGetDrsScale(nativeEnginePtr: Long): Float
    private external fun nativeSimulateFrameTime(nativeEnginePtr: Long, frameTimeMs: Float)

    fun prepare(width: Int, height: Int, assetManager: android.content.res.AssetManager) {
        if (isPrepared && currentWidth == width && currentHeight == height) return
        
        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing native Filament engine for ${width}x${height}...")

        try {
            if (isPrepared) release()

            nativeEnginePtr = nativePrepare(width, height, assetManager)
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

    suspend fun process(input: Bitmap, params: CameraConfiguration, context: android.content.Context): Bitmap = processMutex.withLock {
        if (!isPrepared) {
            Log.w(TAG, "Processor not prepared, preparing now (this will cause lag)...")
            prepare(input.width, input.height, context.assets)
        }
        
        // If resolution changed, we need to re-prepare
        if (input.width != currentWidth || input.height != currentHeight) {
            Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${input.width}x${input.height}. Re-preparing...")
            prepare(input.width, input.height, context.assets)
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
        params: CameraConfiguration,
        context: android.content.Context
    ) {
        processMutex.withLock {
            if (!isPrepared) {
                Log.w(TAG, "Processor not prepared, preparing now...")
                prepare(hardwareBuffer.width, hardwareBuffer.height, context.assets)
            }

            if (hardwareBuffer.width != currentWidth || hardwareBuffer.height != currentHeight) {
                Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${hardwareBuffer.width}x${hardwareBuffer.height}. Re-preparing...")
                prepare(hardwareBuffer.width, hardwareBuffer.height, context.assets)
            }

            if (nativeEnginePtr == 0L) {
                Log.e(TAG, "Native engine pointer is null, skipping hardware buffer processing")
                return@withLock
            }

            val startTime = System.currentTimeMillis()
            val time = (System.currentTimeMillis() % 100000) / 1000f
            try {
                val floatParams = FloatArray(15).apply {
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
                }

                nativeProcessHardwareBuffer(
                    nativeEnginePtr,
                    hardwareBuffer,
                    floatParams
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
        
        isPrepared = false
        Log.i(TAG, "Release complete.")
    }
}
