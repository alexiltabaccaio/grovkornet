package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.util.Log
import com.grovkornet.nativefilmcamera.BuildConfig
import com.grovkornet.nativefilmcamera.errors.CameraCodedException
import com.grovkornet.nativefilmcamera.errors.CameraErrorFactory
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.state.getTargetResolutionValue
import com.grovkornet.nativefilmcamera.state.toRenderParamsArray
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.util.concurrent.Executors

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private var nativeEnginePtr: Long = 0L
    private val processMutex = Mutex()

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    companion object {
        private val singleThreadContext = Executors.newSingleThreadExecutor().asCoroutineDispatcher()
        
        init {
            try {
                System.loadLibrary("grovkornet_engine")
                if (BuildConfig.DEBUG) {
                    Log.i("OffscreenProcessor", "Successfully loaded native grovkornet_engine library")
                }
            } catch (e: Throwable) {
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
        params: FloatArray
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

    suspend fun prepare(width: Int, height: Int, assetManager: android.content.res.AssetManager) = withContext(singleThreadContext) {
        if (isPrepared && currentWidth == width && currentHeight == height) return@withContext
        
        val startTime = System.currentTimeMillis()
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Preparing native Filament engine for ${width}x${height}...")
        }

        try {
            if (isPrepared) {
                if (nativeEnginePtr != 0L) {
                    nativeRelease(nativeEnginePtr)
                    nativeEnginePtr = 0L
                }
                isPrepared = false
            }

            nativeEnginePtr = nativePrepare(width, height, assetManager)
            if (nativeEnginePtr == 0L) {
                throw CameraErrorFactory.createFilamentInitFailed("nativePrepare returned 0 pointer")
            }

            currentWidth = width
            currentHeight = height
            isPrepared = true
            
            if (BuildConfig.DEBUG) {
                Log.i(TAG, "Native preparation complete in ${System.currentTimeMillis() - startTime}ms")
            }
            Unit
        } catch (e: Exception) {
            Log.e(TAG, "Failed to prepare OffscreenProcessor with Filament", e)
            isPrepared = false
            if (e is CameraCodedException) throw e
            throw CameraErrorFactory.createFilamentInitFailed("Failed to prepare OffscreenProcessor with Filament: ${e.message}", e)
        }
    }

    suspend fun process(input: Bitmap, params: CameraConfiguration, context: android.content.Context): Bitmap = withContext(singleThreadContext) {
        processMutex.withLock {
            if (!isPrepared) {
                if (BuildConfig.DEBUG) {
                    Log.w(TAG, "Processor not prepared, preparing now (this will cause lag)...")
                }
                prepare(input.width, input.height, context.assets)
            }
            
            // If resolution changed, we need to re-prepare
            if (input.width != currentWidth || input.height != currentHeight) {
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${input.width}x${input.height}. Re-preparing...")
                }
                prepare(input.width, input.height, context.assets)
            }

            if (nativeEnginePtr == 0L) {
                Log.e(TAG, "Native engine pointer is null, returning original bitmap")
                return@withContext input
            }

            val startTime = System.currentTimeMillis()
            val width = input.width
            val height = input.height

            try {
                val outputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val time = ((System.currentTimeMillis() / 1000.0) % (Math.PI * 2.0)).toFloat()
                
                // Process pixels in C++
                nativeProcessBitmap(
                    nativeEnginePtr,
                    input,
                    outputBitmap,
                    params.toRenderParamsArray(time, params.getTargetResolutionValue(), invertYShift = true)
                )

                // FIX: Filament reads pixels with a bottom-left origin, so the resulting bitmap is upside down.
                // We must vertically flip the bitmap to match Android's top-left coordinate system.
                val flipMatrix = android.graphics.Matrix().apply { postScale(1f, -1f) }
                val flippedBitmap = Bitmap.createBitmap(outputBitmap, 0, 0, width, height, flipMatrix, true)
                outputBitmap.recycle()

                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Frame processed natively in ${System.currentTimeMillis() - startTime}ms")
                }
                return@withContext flippedBitmap
            } catch (e: Exception) {
                Log.e(TAG, "Offscreen native processing failed", e)
                if (e is CameraCodedException) throw e
                throw CameraErrorFactory.createPipelineInitFailed("Offscreen native processing failed: ${e.message}", e)
            }
        }
    }

    suspend fun processHardwareBuffer(
        hardwareBuffer: android.hardware.HardwareBuffer,
        params: CameraConfiguration,
        context: android.content.Context
    ) = withContext(singleThreadContext) {
        processMutex.withLock {
            if (!isPrepared) {
                if (BuildConfig.DEBUG) {
                    Log.w(TAG, "Processor not prepared, preparing now...")
                }
                prepare(hardwareBuffer.width, hardwareBuffer.height, context.assets)
            }

            if (hardwareBuffer.width != currentWidth || hardwareBuffer.height != currentHeight) {
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${hardwareBuffer.width}x${hardwareBuffer.height}. Re-preparing...")
                }
                prepare(hardwareBuffer.width, hardwareBuffer.height, context.assets)
            }

            if (nativeEnginePtr == 0L) {
                Log.e(TAG, "Native engine pointer is null, skipping hardware buffer processing")
                return@withContext
            }

            val startTime = System.currentTimeMillis()
            val time = ((System.currentTimeMillis() / 1000.0) % (Math.PI * 2.0)).toFloat()
            try {
                val floatParams = params.toRenderParamsArray(time, params.getTargetResolutionValue())

                nativeProcessHardwareBuffer(
                    nativeEnginePtr,
                    hardwareBuffer,
                    floatParams
                )
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "HardwareBuffer processed natively (zero-copy) in ${System.currentTimeMillis() - startTime}ms")
                }
                Unit
            } catch (e: Exception) {
                Log.e(TAG, "Offscreen native HardwareBuffer processing failed", e)
                if (e is CameraCodedException) throw e
                throw CameraErrorFactory.createPipelineInitFailed("Offscreen native HardwareBuffer processing failed: ${e.message}", e)
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

    fun release() = kotlinx.coroutines.runBlocking {
        withContext(singleThreadContext) {
            processMutex.withLock {
                if (!isPrepared) return@withContext
                
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Releasing native Filament engine...")
                }
                if (nativeEnginePtr != 0L) {
                    nativeRelease(nativeEnginePtr)
                    nativeEnginePtr = 0L
                }
                
                isPrepared = false
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Release complete.")
                }
            }
        }
    }
}
