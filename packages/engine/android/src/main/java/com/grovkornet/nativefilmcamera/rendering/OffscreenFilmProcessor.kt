package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.opengl.*
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private val eglCore = EglCore()
    private val shaderController = FilmShaderController()
    private var textureId = IntArray(1) { 0 }
    
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
        val sharpening: Float,
        val time: Float = 0.5f,
        val viewportWidth: Float = 1080f,
        val viewportHeight: Float = 1920f
    )

    fun prepare(width: Int, height: Int) {
        if (isPrepared && currentWidth == width && currentHeight == height) return
        
        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Preparing EGL context and Shaders for ${width}x${height}...")

        try {
            if (isPrepared) release()

            eglCore.init(width, height)
            
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

    fun process(input: Bitmap, params: Parameters): Bitmap {
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
            // Upload texture
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId[0])
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
            android.opengl.GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, input, 0)

            // Setup attributes and uniforms
            shaderController.setupAndBind(params)

            // Draw
            GLES20.glViewport(0, 0, width, height)
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)

            // Read back
            val outBuffer = ByteBuffer.allocateDirect(width * height * 4)
            outBuffer.order(ByteOrder.LITTLE_ENDIAN)
            GLES20.glReadPixels(0, 0, width, height, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, outBuffer)
            
            val outputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            outBuffer.rewind()
            outputBitmap.copyPixelsFromBuffer(outBuffer)
            
            Log.i(TAG, "Frame processed in ${System.currentTimeMillis() - startTime}ms")
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
        
        textureId[0] = 0
        isPrepared = false
    }
}
