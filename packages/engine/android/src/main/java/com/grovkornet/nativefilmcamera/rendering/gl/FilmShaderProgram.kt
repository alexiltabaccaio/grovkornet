package com.grovkornet.nativefilmcamera.rendering.gl

import android.opengl.GLES11Ext
import android.opengl.GLES20
import com.grovkornet.nativefilmcamera.rendering.FilmShader
import com.grovkornet.nativefilmcamera.rendering.GLUtils
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import java.nio.FloatBuffer

class FilmShaderProgram {
    private var program = 0
    private var copyProgram = 0

    // Main program uniform/attribute locations
    private var uTransformMatrixLoc = -1
    private var uScaleMatrixLoc = -1
    private var uCropMatrixLoc = -1
    private var uSaturationLoc = -1
    private var uContrastLoc = -1
    private var uAberrationLoc = -1
    private var uAberrationDirectionLoc = -1
    private var uGrainIntensityLoc = -1
    private var uGrainChromaLoc = -1
    private var uGrainSizeLoc = -1
    private var uGrainEnabledLoc = -1
    private var uTimeLoc = -1
    private var uResolutionLoc = -1
    private var uEvLoc = -1
    private var uWhiteBalanceLoc = -1
    private var uTintLoc = -1
    private var uSharpeningLoc = -1
    private var uTextureLoc = -1
    private var aPositionLoc = -1
    private var aTexCoordLoc = -1

    // Copy program uniform/attribute locations
    private var copyTransformMatrixLoc = -1
    private var copyPositionLoc = -1
    private var copyTexCoordLoc = -1
    private var copyTextureLoc = -1

    val isInitialized: Boolean
        get() = program != 0 && copyProgram != 0

    fun init() {
        if (isInitialized) release()

        program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER)
        copyProgram = GLUtils.createProgram(FilmShader.COPY_VERTEX_SHADER, FilmShader.COPY_FRAGMENT_SHADER_OES)

        if (program == 0 || copyProgram == 0) {
            throw RuntimeException("Failed to compile shader programs")
        }

        // Cache locations once
        uTransformMatrixLoc = GLES20.glGetUniformLocation(program, "u_TransformMatrix")
        uScaleMatrixLoc = GLES20.glGetUniformLocation(program, "u_ScaleMatrix")
        uCropMatrixLoc = GLES20.glGetUniformLocation(program, "u_CropMatrix")
        uSaturationLoc = GLES20.glGetUniformLocation(program, "u_Saturation")
        uContrastLoc = GLES20.glGetUniformLocation(program, "u_Contrast")
        uAberrationLoc = GLES20.glGetUniformLocation(program, "u_AberrationIntensity")
        uAberrationDirectionLoc = GLES20.glGetUniformLocation(program, "u_AberrationDirectionType")
        uGrainIntensityLoc = GLES20.glGetUniformLocation(program, "u_GrainIntensity")
        uGrainChromaLoc = GLES20.glGetUniformLocation(program, "u_GrainChroma")
        uGrainSizeLoc = GLES20.glGetUniformLocation(program, "u_GrainSize")
        uGrainEnabledLoc = GLES20.glGetUniformLocation(program, "u_GrainEnabled")
        uTimeLoc = GLES20.glGetUniformLocation(program, "u_Time")
        uResolutionLoc = GLES20.glGetUniformLocation(program, "u_Resolution")
        uEvLoc = GLES20.glGetUniformLocation(program, "u_Ev")
        uWhiteBalanceLoc = GLES20.glGetUniformLocation(program, "u_WhiteBalance")
        uTintLoc = GLES20.glGetUniformLocation(program, "u_Tint")
        uSharpeningLoc = GLES20.glGetUniformLocation(program, "u_Sharpening")
        uTextureLoc = GLES20.glGetUniformLocation(program, "u_Texture")

        aPositionLoc = GLES20.glGetAttribLocation(program, "a_Position")
        aTexCoordLoc = GLES20.glGetAttribLocation(program, "a_TexCoord")

        copyTransformMatrixLoc = GLES20.glGetUniformLocation(copyProgram, "u_TransformMatrix")
        copyTextureLoc = GLES20.glGetUniformLocation(copyProgram, "u_Texture")
        copyPositionLoc = GLES20.glGetAttribLocation(copyProgram, "a_Position")
        copyTexCoordLoc = GLES20.glGetAttribLocation(copyProgram, "a_TexCoord")
    }

    fun drawCopy(
        transformMatrix: FloatArray,
        vertexBuffer: FloatBuffer,
        texCoordBuffer: FloatBuffer,
        cameraTextureId: Int
    ) {
        GLES20.glUseProgram(copyProgram)
        GLES20.glUniformMatrix4fv(copyTransformMatrixLoc, 1, false, transformMatrix, 0)

        GLES20.glEnableVertexAttribArray(copyPositionLoc)
        GLES20.glVertexAttribPointer(copyPositionLoc, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(copyTexCoordLoc)
        GLES20.glVertexAttribPointer(copyTexCoordLoc, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES20.glUniform1i(copyTextureLoc, 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    fun drawMain(
        identityMatrix: FloatArray,
        scaleMatrix: FloatArray,
        cropMatrix: FloatArray,
        vertexBuffer: FloatBuffer,
        texCoordBuffer: FloatBuffer,
        textureId: Int,
        config: CameraConfiguration,
        viewportWidth: Int,
        viewportHeight: Int
    ) {
        GLES20.glUseProgram(program)

        GLES20.glUniformMatrix4fv(uTransformMatrixLoc, 1, false, identityMatrix, 0)
        GLES20.glUniformMatrix4fv(uScaleMatrixLoc, 1, false, scaleMatrix, 0)
        GLES20.glUniformMatrix4fv(uCropMatrixLoc, 1, false, cropMatrix, 0)

        // Setup Uniforms
        GLES20.glUniform1f(uSaturationLoc, config.saturation)
        GLES20.glUniform1f(uContrastLoc, config.contrast)
        GLES20.glUniform1f(uAberrationLoc, config.aberration)
        GLES20.glUniform1i(uAberrationDirectionLoc, config.aberrationDirection)
        GLES20.glUniform1f(uGrainIntensityLoc, config.grainIntensity)
        GLES20.glUniform1f(uGrainChromaLoc, config.grainChroma)
        GLES20.glUniform1f(uGrainSizeLoc, config.grainSize)
        GLES20.glUniform1f(uGrainEnabledLoc, if (config.grainEnabled) 1.0f else 0.0f)
        GLES20.glUniform1f(uTimeLoc, (System.currentTimeMillis() % 10000) / 1000f)
        GLES20.glUniform2f(uResolutionLoc, viewportWidth.toFloat(), viewportHeight.toFloat())
        GLES20.glUniform1f(uEvLoc, config.ev)
        GLES20.glUniform1f(uWhiteBalanceLoc, if (config.whiteBalanceAuto) 5000.0f else config.whiteBalance)
        GLES20.glUniform1f(uTintLoc, if (config.whiteBalanceAuto) 0.0f else config.tint)
        GLES20.glUniform1f(uSharpeningLoc, config.sharpening)

        GLES20.glEnableVertexAttribArray(aPositionLoc)
        GLES20.glVertexAttribPointer(aPositionLoc, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(aTexCoordLoc)
        GLES20.glVertexAttribPointer(aTexCoordLoc, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId)
        GLES20.glUniform1i(uTextureLoc, 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    fun release() {
        if (program != 0) {
            GLES20.glDeleteProgram(program)
            program = 0
        }
        if (copyProgram != 0) {
            GLES20.glDeleteProgram(copyProgram)
            copyProgram = 0
        }
    }
}
