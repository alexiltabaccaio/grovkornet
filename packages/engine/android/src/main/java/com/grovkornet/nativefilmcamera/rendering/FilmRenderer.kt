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
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class FilmRenderer(
    @Volatile private var config: CameraConfiguration,
    private val listener: Listener
) : GLSurfaceView.Renderer, SurfaceTexture.OnFrameAvailableListener {

    interface Listener {
        fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture)
        fun onFpsUpdate(fps: Int, stampedFps: Int, resolution: String)
        fun requestRender()
    }

    fun updateConfig(newConfig: CameraConfiguration) {
        config = newConfig.copy()
    }

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
    private var uTintLoc = -1
    private var uSharpeningLoc = -1
    private var uTextureLoc = -1
    private var aPositionLoc = -1
    private var aTexCoordLoc = -1

    // FBO Variables
    private var fboId = 0
    private var fboTextureId = 0
    private var fboWidth = 0
    private var fboHeight = 0

    private var copyProgram = 0
    private var copyTransformMatrixLoc = -1
    private var copyPositionLoc = -1
    private var copyTexCoordLoc = -1
    private var copyTextureLoc = -1

    private val vertexBuffer: FloatBuffer
    private val texCoordBuffer: FloatBuffer

    private val transformMatrix = FloatArray(16)
    private val scaleMatrix = FloatArray(16)
    private val cropMatrix = FloatArray(16)
    private val identityMatrix = FloatArray(16).apply { android.opengl.Matrix.setIdentityM(this, 0) }

    private var viewportWidth = 0
    private var viewportHeight = 0
    
    @Volatile var cameraWidth = 0
    @Volatile var cameraHeight = 0

    private var framesCount = 0
    private var fboFramesCount = 0
    private var lastLogTime = 0L
    private var timeAccumulator = 0L
    private var lastUpdateTime = 0L

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
        vertexBuffer = java.nio.ByteBuffer.allocateDirect(VERTICES.size * 4)
            .order(java.nio.ByteOrder.nativeOrder())
            .asFloatBuffer()
            .put(VERTICES)
        vertexBuffer.position(0)
        
        texCoordBuffer = java.nio.ByteBuffer.allocateDirect(TEX_COORDS.size * 4)
            .order(java.nio.ByteOrder.nativeOrder())
            .asFloatBuffer()
            .put(TEX_COORDS)
        texCoordBuffer.position(0)
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER) // Now uses sampler2D
        copyProgram = GLUtils.createProgram(FilmShader.COPY_VERTEX_SHADER, FilmShader.COPY_FRAGMENT_SHADER_OES)

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

    private fun initFboIfNeeded(width: Int, height: Int) {
        if (width <= 0 || height <= 0) return
        if (fboWidth == width && fboHeight == height && fboId != 0) return

        if (fboId != 0) {
            GLES20.glDeleteFramebuffers(1, intArrayOf(fboId), 0)
            GLES20.glDeleteTextures(1, intArrayOf(fboTextureId), 0)
        }

        val fbos = IntArray(1)
        val texs = IntArray(1)

        GLES20.glGenFramebuffers(1, fbos, 0)
        GLES20.glGenTextures(1, texs, 0)

        fboId = fbos[0]
        fboTextureId = texs[0]
        fboWidth = width
        fboHeight = height

        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, fboTextureId)
        GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, width, height, 0, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, null)
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)

        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboId)
        GLES20.glFramebufferTexture2D(GLES20.GL_FRAMEBUFFER, GLES20.GL_COLOR_ATTACHMENT0, GLES20.GL_TEXTURE_2D, fboTextureId, 0)

        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
        GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
    }

    override fun onDrawFrame(gl: GL10?) {
        val st = surfaceTexture ?: return
        st.updateTexImage()
        st.getTransformMatrix(transformMatrix)
        
        updateFps()

        if (cameraWidth <= 0 || cameraHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
            return
        }

        val isViewPortrait = viewportWidth < viewportHeight
        val isCameraPortrait = cameraWidth < cameraHeight
        val effCamWidth = if (isViewPortrait == isCameraPortrait) cameraWidth else cameraHeight
        val effCamHeight = if (isViewPortrait == isCameraPortrait) cameraHeight else cameraWidth

        val now = System.currentTimeMillis()
        if (lastUpdateTime == 0L) lastUpdateTime = now
        val dt = now - lastUpdateTime
        lastUpdateTime = now

        val currentConfig = config
        val interval = 1000L / if (currentConfig.targetFps > 0) currentConfig.targetFps else 60
        timeAccumulator += dt

        // We use a margin of 3ms to ensure we don't skip a frame just because it arrived 1 or 2ms early
        // This is crucial when targetFps matches hwFps (e.g. 60 target on a 60hz screen).
        var shouldCapture = false
        if (timeAccumulator >= interval - 3) {
            shouldCapture = true
            // If we lagged severely (e.g. paused app), don't burst capture
            if (timeAccumulator > interval * 3) {
                timeAccumulator = 0
            } else {
                timeAccumulator -= interval
            }
        }

        // Pass 1: OES -> FBO (Only when it's time to capture)
        if (shouldCapture) {
            fboFramesCount++
            initFboIfNeeded(effCamWidth, effCamHeight)

            if (fboId != 0) {
                GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, fboId)
                GLES20.glViewport(0, 0, fboWidth, fboHeight)
                GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
                
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
                GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)
            }
        }

        // Pass 2: FBO -> Screen (Always)
        GLES20.glViewport(0, 0, viewportWidth, viewportHeight)
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
        GLES20.glUseProgram(program)

        // The FBO texture is already correctly oriented, so we use Identity matrix for FilmShader
        GLES20.glUniformMatrix4fv(uTransformMatrixLoc, 1, false, identityMatrix, 0)

        calculateScaleMatrix()
        GLES20.glUniformMatrix4fv(uScaleMatrixLoc, 1, false, scaleMatrix, 0)
        GLES20.glUniformMatrix4fv(uCropMatrixLoc, 1, false, cropMatrix, 0)

        // Setup Uniforms
        GLES20.glUniform1f(uSaturationLoc, currentConfig.saturation)
        GLES20.glUniform1f(uContrastLoc, currentConfig.contrast)
        GLES20.glUniform1f(uAberrationLoc, currentConfig.aberration)
        GLES20.glUniform1i(uAberrationDirectionLoc, currentConfig.aberrationDirection)
        GLES20.glUniform1f(uGrainIntensityLoc, currentConfig.grainIntensity)
        GLES20.glUniform1f(uGrainChromaLoc, currentConfig.grainChroma)
        GLES20.glUniform1f(uGrainSizeLoc, currentConfig.grainSize)
        GLES20.glUniform1f(uGrainEnabledLoc, if (currentConfig.grainEnabled) 1.0f else 0.0f)
        GLES20.glUniform1f(uTimeLoc, (System.currentTimeMillis() % 10000) / 1000f)
        GLES20.glUniform2f(uResolutionLoc, viewportWidth.toFloat(), viewportHeight.toFloat())
        GLES20.glUniform1f(uEvLoc, currentConfig.ev)
        GLES20.glUniform1f(uWhiteBalanceLoc, if (currentConfig.whiteBalanceAuto) 5000.0f else currentConfig.whiteBalance)
        GLES20.glUniform1f(uTintLoc, if (currentConfig.whiteBalanceAuto) 0.0f else currentConfig.tint)
        GLES20.glUniform1f(uSharpeningLoc, currentConfig.sharpening)

        GLES20.glEnableVertexAttribArray(aPositionLoc)
        GLES20.glVertexAttribPointer(aPositionLoc, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(aTexCoordLoc)
        GLES20.glVertexAttribPointer(aTexCoordLoc, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        // Bind FBO texture (sampler2D) instead of OES texture
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, if (fboTextureId != 0) fboTextureId else cameraTextureId) 
        GLES20.glUniform1i(uTextureLoc, 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    private fun updateFps() {
        val now = System.currentTimeMillis()
        if (lastLogTime == 0L) lastLogTime = now
        framesCount++
        if (now - lastLogTime >= 500) {
            val actualFps = (framesCount * 1000) / (now - lastLogTime)
            val actualStampedFps = (fboFramesCount * 1000) / (now - lastLogTime)
            listener.onFpsUpdate(actualFps.toInt(), actualStampedFps.toInt(), "${cameraWidth}x${cameraHeight}")
            lastLogTime = now
            framesCount = 0
            fboFramesCount = 0
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
            val targetAspect = when (config.aspectRatio) {
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
        // We MUST request render on every frame, otherwise updateTexImage is never called
        // and the camera buffer queue fills up, permanently freezing the camera.
        listener.requestRender()
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
        if (cameraTextureId != 0) {
            GLES20.glDeleteTextures(1, intArrayOf(cameraTextureId), 0)
            cameraTextureId = 0
        }
        if (fboId != 0) {
            GLES20.glDeleteFramebuffers(1, intArrayOf(fboId), 0)
            fboId = 0
        }
        if (fboTextureId != 0) {
            GLES20.glDeleteTextures(1, intArrayOf(fboTextureId), 0)
            fboTextureId = 0
        }
        surfaceTexture?.release()
        surfaceTexture = null
    }
}
