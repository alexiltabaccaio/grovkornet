package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.opengl.*
import android.util.Log
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.suspendCancellableCoroutine
import java.nio.ByteBuffer
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private val eglCore = EglCore()
    private val shaderController = FilmShaderController()
    private var textureId = IntArray(1) { 0 }
    private var imageReader: ImageReader? = null
    
    private var handlerThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null
    private val processMutex = Mutex()

    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    data class Parameters(
        val saturation: Float,
        val contrast: Float,
        val aberration: Float,
        val aberrationDirection: Int,
        val grainIntensity: Float,
        val grainChroma: Float,
        val grainSize: Float,
        val grainEnabled: Boolean,
        val ev: Float,
        val whiteBalance: Float,
        val tint: Float,
        val sharpening: Float,
        val time: Float = 0.5f,
        val viewportWidth: Float = 1080f,
        val viewportHeight: Float = 1920f
    )

    fun prepare(width: Int, height: Int) {
        if (isPrepared && currentWidth == width && currentHeight == height) return
        
        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing EGL context and ImageReader for ${width}x${height}...")

        try {
            if (isPrepared) release()

            if (handlerThread == null) {
                handlerThread = HandlerThread("ImageReaderThread").apply { start() }
                backgroundHandler = Handler(handlerThread!!.looper)
            }

            val reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
            imageReader = reader
            eglCore.init(reader.surface)
            
            shaderController.init()
            GLES20.glGenTextures(1, textureId, 0)

            currentWidth = width
            currentHeight = height
            isPrepared = true
            
            Log.i(TAG, "Preparation complete in ${System.currentTimeMillis() - startTime}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to prepare OffscreenProcessor", e)
            isPrepared = false
        }
    }

    suspend fun process(input: Bitmap, params: Parameters): Bitmap = processMutex.withLock {
        if (!isPrepared) {
            Log.w(TAG, "Processor not prepared, preparing now (this will cause lag)...")
            prepare(input.width, input.height)
        }
        
        // If resolution changed, we need to re-prepare
        if (input.width != currentWidth || input.height != currentHeight) {
            Log.i(TAG, "Resolution changed from ${currentWidth}x${currentHeight} to ${input.width}x${input.height}. Re-preparing...")
            prepare(input.width, input.height)
        }

        val startTime = System.currentTimeMillis()
        val width = input.width
        val height = input.height

        try {
            // Ensure EGL context is current on this thread
            eglCore.makeCurrent()

            // Upload texture
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId[0])
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
            android.opengl.GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, input, 0)

            // Setup attributes and uniforms
            shaderController.setupAndBind(params)

            // Draw
            GLES20.glViewport(0, 0, width, height)
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)

            val reader = imageReader ?: throw RuntimeException("ImageReader is null")
            val outputBitmap = suspendCancellableCoroutine<Bitmap> { cont ->
                reader.setOnImageAvailableListener({ ir ->
                    ir.setOnImageAvailableListener(null, null)
                    try {
                        val image = ir.acquireLatestImage()
                        if (image == null) {
                            cont.resumeWithException(RuntimeException("acquireLatestImage returned null"))
                            return@setOnImageAvailableListener
                        }
                        image.use { img ->
                            val plane = img.planes[0]
                            val buffer = plane.buffer
                            val pixelStride = plane.pixelStride
                            val rowStride = plane.rowStride
                            val rowPadding = rowStride - pixelStride * width

                            val bmp = if (rowPadding == 0) {
                                val cleanBmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                                cleanBmp.copyPixelsFromBuffer(buffer)
                                cleanBmp
                            } else {
                                val paddedWidth = rowStride / pixelStride
                                val paddedBmp = Bitmap.createBitmap(paddedWidth, height, Bitmap.Config.ARGB_8888)
                                paddedBmp.copyPixelsFromBuffer(buffer)
                                Bitmap.createBitmap(paddedBmp, 0, 0, width, height)
                            }
                            cont.resume(bmp)
                        }
                    } catch (e: Exception) {
                        cont.resumeWithException(e)
                    }
                }, backgroundHandler)

                // Submit frame to ImageReader
                eglCore.swapBuffers()
                
                // Release EGL context from current thread before suspending
                eglCore.makeNothingCurrent()
            }

            Log.i(TAG, "Frame processed asynchronously in ${System.currentTimeMillis() - startTime}ms")
            return outputBitmap
        } catch (e: Exception) {
            Log.e(TAG, "Offscreen processing failed", e)
            return input
        }
    }

    fun release() {
        if (!isPrepared) return
        
        Log.i(TAG, "Releasing EGL context and resources...")
        eglCore.release()
        
        shaderController.release()
        if (textureId[0] != 0) GLES20.glDeleteTextures(1, textureId, 0)
        imageReader?.close()
        imageReader = null
        
        handlerThread?.quitSafely()
        handlerThread = null
        backgroundHandler = null

        textureId[0] = 0
        isPrepared = false
    }
}
