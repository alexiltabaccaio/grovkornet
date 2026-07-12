package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.util.Log
import com.grovkornet.nativefilmcamera.BuildConfig
import com.grovkornet.nativefilmcamera.errors.CameraCodedException
import com.grovkornet.nativefilmcamera.errors.CameraErrorFactory
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import java.util.concurrent.Executors

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private var nativeProcessor: OffscreenFilmProcessorNative? = null
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

    suspend fun prepare(width: Int, height: Int, assetManager: android.content.res.AssetManager) = withContext(singleThreadContext) {
        if (isPrepared && currentWidth == width && currentHeight == height) return@withContext
        
        val startTime = System.currentTimeMillis()
        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Preparing native Filament engine for ${width}x${height}...")
        }

        try {
            if (isPrepared) {
                nativeProcessor?.release()
                isPrepared = false
            }

            if (nativeProcessor == null) {
                nativeProcessor = OffscreenFilmProcessorNative()
            }
            nativeProcessor!!.prepare(width, height, assetManager)

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

            if (!isPrepared) {
                Log.e(TAG, "Native engine is not prepared, returning original bitmap")
                return@withContext input
            }

            val startTime = System.currentTimeMillis()
            val width = input.width
            val height = input.height

            var outputBitmap: Bitmap? = null
            try {
                outputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                
                // Process pixels in C++ (with C++ flip enabled)
                nativeProcessor!!.processBitmap(
                    input,
                    outputBitmap,
                    params.nativePointer,
                    true
                )

                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Frame processed natively (with C++ flip) in ${System.currentTimeMillis() - startTime}ms")
                }
                return@withContext outputBitmap
            } catch (e: Throwable) {
                Log.e(TAG, "Offscreen native processing failed", e)
                outputBitmap?.recycle()
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

            if (!isPrepared) {
                Log.e(TAG, "Native engine is not prepared, skipping hardware buffer processing")
                return@withContext
            }

            val startTime = System.currentTimeMillis()
            try {
                nativeProcessor!!.processHardwareBuffer(
                    hardwareBuffer,
                    params.nativePointer,
                    false
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
        if (isPrepared) {
            nativeProcessor!!.updateOverlay(bitmaps)
        }
    }

    fun getDrsScale(): Float {
        return if (isPrepared) nativeProcessor!!.getDrsScale() else 1.0f
    }

    fun simulateFrameTime(frameTimeMs: Float) {
        if (isPrepared) {
            nativeProcessor!!.simulateFrameTime(frameTimeMs)
        }
    }

    fun release() {
        kotlinx.coroutines.CoroutineScope(singleThreadContext).launch {
            processMutex.withLock {
                if (!isPrepared) return@launch
                
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Releasing native Filament engine...")
                }
                nativeProcessor?.release()
                nativeProcessor = null
                isPrepared = false
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Release complete.")
                }
            }
        }
    }
}
