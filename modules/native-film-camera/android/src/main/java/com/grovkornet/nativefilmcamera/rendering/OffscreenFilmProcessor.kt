package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.opengl.*
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

class OffscreenFilmProcessor {
    private val TAG = "OffscreenProcessor"

    private var eglDisplay = EGL14.EGL_NO_DISPLAY
    private var eglContext = EGL14.EGL_NO_CONTEXT
    private var eglSurface = EGL14.EGL_NO_SURFACE
    private var program = 0
    private var textureId = IntArray(1) { 0 }
    
    private var isPrepared = false
    private var currentWidth = 0
    private var currentHeight = 0

    private var vertexBuffer: FloatBuffer? = null
    private var texCoordBuffer: FloatBuffer? = null

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

            initEGL(width, height)
            
            program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER)
            GLES20.glGenTextures(1, textureId, 0)
            
            vertexBuffer = createFloatBuffer(floatArrayOf(-1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f))
            texCoordBuffer = createFloatBuffer(floatArrayOf(0f, 0f, 1f, 0f, 0f, 1f, 1f, 1f))

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
            GLES20.glUseProgram(program)

            // Upload texture
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId[0])
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
            GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
            android.opengl.GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, input, 0)

            // Setup attributes
            val aPos = GLES20.glGetAttribLocation(program, "a_Position")
            val aTex = GLES20.glGetAttribLocation(program, "a_TexCoord")
            GLES20.glEnableVertexAttribArray(aPos)
            GLES20.glVertexAttribPointer(aPos, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)
            GLES20.glEnableVertexAttribArray(aTex)
            GLES20.glVertexAttribPointer(aTex, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

            // Uniforms
            GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_TransformMatrix"), 1, false, FloatArray(16).apply { Matrix.setIdentityM(this, 0) }, 0)
            GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_ScaleMatrix"), 1, false, FloatArray(16).apply { Matrix.setIdentityM(this, 0) }, 0)
            
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Saturation"), params.saturation)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Contrast"), params.contrast)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_AberrationIntensity"), params.aberration)
            GLES20.glUniform1i(GLES20.glGetUniformLocation(program, "u_AberrationDirectionType"), params.aberrationDirection)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainIntensity"), params.grainIntensity)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainChroma"), params.grainChroma)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainSize"), params.grainSize)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainEnabled"), if (params.grainEnabled) 1.0f else 0.0f)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Time"), params.time)
            GLES20.glUniform2f(GLES20.glGetUniformLocation(program, "u_Resolution"), params.viewportWidth, params.viewportHeight)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Ev"), params.ev)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_WhiteBalance"), params.whiteBalance)
            GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Sharpening"), params.sharpening)

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

    private fun initEGL(width: Int, height: Int) {
        eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
        val version = IntArray(2)
        EGL14.eglInitialize(eglDisplay, version, 0, version, 1)

        val configAttribs = intArrayOf(
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_DEPTH_SIZE, 0,
            EGL14.EGL_STENCIL_SIZE, 0,
            EGL14.EGL_NONE
        )

        val configs = arrayOfNulls<EGLConfig>(1)
        val numConfigs = IntArray(1)
        EGL14.eglChooseConfig(eglDisplay, configAttribs, 0, configs, 0, 1, numConfigs, 0)
        val config = configs[0]

        val contextAttribs = intArrayOf(
            EGL14.EGL_CONTEXT_CLIENT_VERSION, 2,
            EGL14.EGL_NONE
        )
        eglContext = EGL14.eglCreateContext(eglDisplay, config, EGL14.EGL_NO_CONTEXT, contextAttribs, 0)

        val surfaceAttribs = intArrayOf(
            EGL14.EGL_WIDTH, width,
            EGL14.EGL_HEIGHT, height,
            EGL14.EGL_NONE
        )
        eglSurface = EGL14.eglCreatePbufferSurface(eglDisplay, config, surfaceAttribs, 0)

        EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)
    }

    fun release() {
        if (!isPrepared) return
        
        Log.i(TAG, "Releasing EGL context and resources...")
        if (eglDisplay != EGL14.EGL_NO_DISPLAY) {
            EGL14.eglMakeCurrent(eglDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
            if (eglSurface != EGL14.EGL_NO_SURFACE) EGL14.eglDestroySurface(eglDisplay, eglSurface)
            if (eglContext != EGL14.EGL_NO_CONTEXT) EGL14.eglDestroyContext(eglDisplay, eglContext)
            EGL14.eglReleaseThread()
            EGL14.eglTerminate(eglDisplay)
        }
        
        if (program != 0) GLES20.glDeleteProgram(program)
        if (textureId[0] != 0) GLES20.glDeleteTextures(1, textureId, 0)
        
        eglDisplay = EGL14.EGL_NO_DISPLAY
        eglContext = EGL14.EGL_NO_CONTEXT
        eglSurface = EGL14.EGL_NO_SURFACE
        program = 0
        textureId[0] = 0
        isPrepared = false
    }

    private fun createFloatBuffer(coords: FloatArray): FloatBuffer {
        return ByteBuffer.allocateDirect(coords.size * 4).run {
            order(ByteOrder.nativeOrder())
            asFloatBuffer().apply {
                put(coords)
                position(0)
            }
        }
    }
}
