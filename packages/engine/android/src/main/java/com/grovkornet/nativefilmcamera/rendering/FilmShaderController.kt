package com.grovkornet.nativefilmcamera.rendering

import android.opengl.GLES20
import android.opengl.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

class FilmShaderController {
    private var program = 0
    private var vertexBuffer: FloatBuffer? = null
    private var texCoordBuffer: FloatBuffer? = null

    val isInitialized: Boolean
        get() = program != 0

    fun init() {
        if (isInitialized) release()

        program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER)
        if (program == 0) {
            throw RuntimeException("Failed to create shader program")
        }

        vertexBuffer = createFloatBuffer(floatArrayOf(-1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f))
        texCoordBuffer = createFloatBuffer(floatArrayOf(0f, 1f, 1f, 1f, 0f, 0f, 1f, 0f))
    }

    fun setupAndBind(params: OffscreenFilmProcessor.Parameters) {
        if (!isInitialized) {
            throw IllegalStateException("FilmShaderController not initialized")
        }

        GLES20.glUseProgram(program)

        // Setup attributes
        val aPos = GLES20.glGetAttribLocation(program, "a_Position")
        val aTex = GLES20.glGetAttribLocation(program, "a_TexCoord")
        GLES20.glEnableVertexAttribArray(aPos)
        GLES20.glVertexAttribPointer(aPos, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)
        GLES20.glEnableVertexAttribArray(aTex)
        GLES20.glVertexAttribPointer(aTex, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        // Uniforms
        val identityMatrix = FloatArray(16).apply { Matrix.setIdentityM(this, 0) }
        GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_TransformMatrix"), 1, false, identityMatrix, 0)
        GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_ScaleMatrix"), 1, false, identityMatrix, 0)
        GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_CropMatrix"), 1, false, identityMatrix, 0)
        
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
    }

    fun release() {
        if (program != 0) {
            GLES20.glDeleteProgram(program)
            program = 0
        }
        vertexBuffer = null
        texCoordBuffer = null
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
