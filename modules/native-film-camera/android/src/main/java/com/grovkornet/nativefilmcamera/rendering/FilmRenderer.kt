package com.grovkornet.nativefilmcamera.rendering

import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class FilmRenderer(private val listener: Listener) : GLSurfaceView.Renderer, SurfaceTexture.OnFrameAvailableListener {

    interface Listener {
        fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture)
        fun onFpsUpdate(fps: Int, resolution: String)
        fun requestRender()
    }

    // Uniforms (Volatile for thread-safety between UI and GL threads)
    @Volatile var saturation: Float = 1.0f
    @Volatile var contrast: Float = 1.0f
    @Volatile var grainIntensity: Float = 0.0f
    @Volatile var grainChroma: Float = 0.0f
    @Volatile var grainSize: Float = 1.0f
    @Volatile var grainEnabled: Boolean = true
    @Volatile var aberration: Float = 0.0f
    @Volatile var aberrationDirection: Int = 0
    @Volatile var ev: Float = 0.0f
    @Volatile var whiteBalance: Float = 5000.0f
    @Volatile var whiteBalanceAuto: Boolean = true
    @Volatile var sharpening: Float = 0.0f
    @Volatile var aspectRatio: Int = 0

    private var program = 0
    private var cameraTextureId = 0
    private var surfaceTexture: SurfaceTexture? = null

    // Cached Locations
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
    private var uSharpeningLoc = -1
    private var uTextureLoc = -1
    private var aPositionLoc = -1
    private var aTexCoordLoc = -1

    private val vertexBuffer: FloatBuffer
    private val texCoordBuffer: FloatBuffer

    private val transformMatrix = FloatArray(16)
    private val scaleMatrix = FloatArray(16)
    private val cropMatrix = FloatArray(16)

    private var viewportWidth = 0
    private var viewportHeight = 0
    
    @Volatile var cameraWidth = 0
    @Volatile var cameraHeight = 0

    private var framesCount = 0
    private var lastLogTime = 0L

    private val VERTICES = floatArrayOf(
        -1.0f, -1.0f,
         1.0f, -1.0f,
        -1.0f,  1.0f,
         1.0f,  1.0f
    )

    private val TEX_COORDS = floatArrayOf(
        0.0f, 0.0f,
        1.0f, 0.0f,
        0.0f, 1.0f,
        1.0f, 1.0f
    )

    init {
        vertexBuffer = ByteBuffer.allocateDirect(VERTICES.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer()
            .put(VERTICES)
        vertexBuffer.position(0)
        
        texCoordBuffer = ByteBuffer.allocateDirect(TEX_COORDS.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer()
            .put(TEX_COORDS)
        texCoordBuffer.position(0)
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER_OES)

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
        uSharpeningLoc = GLES20.glGetUniformLocation(program, "u_Sharpening")
        uTextureLoc = GLES20.glGetUniformLocation(program, "u_Texture")
        
        aPositionLoc = GLES20.glGetAttribLocation(program, "a_Position")
        aTexCoordLoc = GLES20.glGetAttribLocation(program, "a_TexCoord")

        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)
        cameraTextureId = textures[0]

        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES20.glGenerateMipmap(GLES11Ext.GL_TEXTURE_EXTERNAL_OES) // Optional but good for scale
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)

        val st = SurfaceTexture(cameraTextureId)
        st.setOnFrameAvailableListener(this)
        surfaceTexture = st
        
        listener.onSurfaceTextureCreated(st)
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        viewportWidth = width
        viewportHeight = height
        GLES20.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        val st = surfaceTexture ?: return
        st.updateTexImage()
        st.getTransformMatrix(transformMatrix)

        updateFps()

        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
        GLES20.glUseProgram(program)

        // Use cached locations for performance
        GLES20.glUniformMatrix4fv(uTransformMatrixLoc, 1, false, transformMatrix, 0)

        calculateScaleMatrix()
        GLES20.glUniformMatrix4fv(uScaleMatrixLoc, 1, false, scaleMatrix, 0)
        GLES20.glUniformMatrix4fv(uCropMatrixLoc, 1, false, cropMatrix, 0)

        // Setup Uniforms using cached IDs
        GLES20.glUniform1f(uSaturationLoc, saturation)
        GLES20.glUniform1f(uContrastLoc, contrast)
        GLES20.glUniform1f(uAberrationLoc, aberration)
        GLES20.glUniform1i(uAberrationDirectionLoc, aberrationDirection)
        GLES20.glUniform1f(uGrainIntensityLoc, grainIntensity)
        GLES20.glUniform1f(uGrainChromaLoc, grainChroma)
        GLES20.glUniform1f(uGrainSizeLoc, grainSize)
        GLES20.glUniform1f(uGrainEnabledLoc, if (grainEnabled) 1.0f else 0.0f)
        GLES20.glUniform1f(uTimeLoc, (System.currentTimeMillis() % 10000) / 1000f)
        GLES20.glUniform2f(uResolutionLoc, viewportWidth.toFloat(), viewportHeight.toFloat())
        GLES20.glUniform1f(uEvLoc, ev)
        GLES20.glUniform1f(uWhiteBalanceLoc, if (whiteBalanceAuto) 5000.0f else whiteBalance)
        GLES20.glUniform1f(uSharpeningLoc, sharpening)

        GLES20.glEnableVertexAttribArray(aPositionLoc)
        GLES20.glVertexAttribPointer(aPositionLoc, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(aTexCoordLoc)
        GLES20.glVertexAttribPointer(aTexCoordLoc, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES20.glUniform1i(uTextureLoc, 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    private fun updateFps() {
        val now = System.currentTimeMillis()
        if (lastLogTime == 0L) lastLogTime = now
        framesCount++
        if (now - lastLogTime >= 500) {
            val actualFps = (framesCount * 1000) / (now - lastLogTime)
            listener.onFpsUpdate(actualFps.toInt(), "${cameraWidth}x${cameraHeight}")
            lastLogTime = now
            framesCount = 0
        }
    }

    private fun calculateScaleMatrix() {
        var scaleX = 1.0f
        var scaleY = 1.0f
        var cropX = 1.0f
        var cropY = 1.0f

        if (cameraWidth > 0 && cameraHeight > 0 && viewportWidth > 0 && viewportHeight > 0) {
            val isViewPortrait = viewportWidth < viewportHeight
            val isCameraPortrait = cameraWidth < cameraHeight
            
            val effCamWidth = if (isViewPortrait == isCameraPortrait) cameraWidth.toFloat() else cameraHeight.toFloat()
            val effCamHeight = if (isViewPortrait == isCameraPortrait) cameraHeight.toFloat() else cameraWidth.toFloat()

            val viewAspect = viewportWidth.toFloat() / viewportHeight.toFloat()
            val targetAspect = when (aspectRatio) {
                0 -> 4f / 3f
                1 -> 16f / 9f
                2 -> 1f / 1f
                3 -> 3f / 2f
                4 -> 65f / 24f
                else -> 4f / 3f
            }
            
            val camAspect = effCamWidth / effCamHeight

            // First: Scale the GEOMETRY to fit the target aspect ratio into the viewport (Letterbox/Fill)
            val finalTargetAspect = if (isViewPortrait) 1f / targetAspect else targetAspect
            
            if (viewAspect > finalTargetAspect) {
                // Viewport is wider than target -> Letterbox on sides (scaleX < 1)
                scaleX = finalTargetAspect / viewAspect
            } else {
                // Viewport is taller than target -> Letterbox on top/bottom (scaleY < 1)
                scaleY = viewAspect / finalTargetAspect
            }
            
            // Second: Crop the TEXTURE to match the target aspect ratio
            if (finalTargetAspect > camAspect) {
                // Target is wider than camera. Crop camera vertically.
                // e.g. camera is 0.75 (4:3), target is 1.0 (1:1). We need to shrink the height we sample.
                cropY = camAspect / finalTargetAspect
            } else {
                // Target is taller than camera. Crop camera horizontally.
                cropX = finalTargetAspect / camAspect
            }
        }

        Matrix.setIdentityM(scaleMatrix, 0)
        Matrix.scaleM(scaleMatrix, 0, scaleX, scaleY, 1.0f)

        Matrix.setIdentityM(cropMatrix, 0)
        // Texture coords are 0 to 1. To crop the center, translate to center (0.5), scale down, translate back.
        Matrix.translateM(cropMatrix, 0, 0.5f, 0.5f, 0.0f)
        Matrix.scaleM(cropMatrix, 0, cropX, cropY, 1.0f)
        Matrix.translateM(cropMatrix, 0, -0.5f, -0.5f, 0.0f)
    }


    override fun onFrameAvailable(surfaceTexture: SurfaceTexture?) {
        // This is called from the GL thread or a background thread depending on how SurfaceTexture is configured.
        listener.requestRender()
    }
    
    fun release() {
        if (program != 0) {
            GLES20.glDeleteProgram(program)
            program = 0
        }
        if (cameraTextureId != 0) {
            GLES20.glDeleteTextures(1, intArrayOf(cameraTextureId), 0)
            cameraTextureId = 0
        }
        surfaceTexture?.release()
        surfaceTexture = null
    }
}
