package com.grovkornet.nativefilmcamera.rendering

import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.rendering.gl.FboManager
import com.grovkornet.nativefilmcamera.rendering.gl.FilmShaderProgram
import com.grovkornet.nativefilmcamera.rendering.utils.FrameTimingController
import com.grovkornet.nativefilmcamera.rendering.utils.MatrixTransformCalculator

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

    private val shaderProgram = FilmShaderProgram()
    private val fboManager = FboManager()
    private val matrixCalculator = MatrixTransformCalculator()
    private val timingController = FrameTimingController()

    private var cameraTextureId = 0
    private var surfaceTexture: SurfaceTexture? = null

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
        shaderProgram.init()

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
        
        timingController.updateFps { fps, stampedFps ->
            listener.onFpsUpdate(fps, stampedFps, "${cameraWidth}x${cameraHeight}")
        }

        if (cameraWidth <= 0 || cameraHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
            return
        }

        val isViewPortrait = viewportWidth < viewportHeight
        val isCameraPortrait = cameraWidth < cameraHeight
        val effCamWidth = if (isViewPortrait == isCameraPortrait) cameraWidth else cameraHeight
        val effCamHeight = if (isViewPortrait == isCameraPortrait) cameraHeight else cameraWidth

        val currentConfig = config

        val targetRes = when(currentConfig.resolutionSetting) {
            0 -> 2160 // 4K
            1 -> 1080 // 1080p
            2 -> 720  // 720p
            3 -> 480  // 480p
            4 -> 360  // 360p
            5 -> 240  // 240p
            6 -> 144  // 144p
            else -> 1080
        }
        
        val scale = targetRes.toFloat() / Math.min(effCamWidth, effCamHeight).toFloat()
        val fboW = if (scale < 1.0f) (effCamWidth * scale).toInt() else effCamWidth
        val fboH = if (scale < 1.0f) (effCamHeight * scale).toInt() else effCamHeight
        val useNearest = targetRes <= 480

        val shouldCapture = timingController.shouldCaptureFrame(currentConfig.targetFps)

        // Pass 1: OES -> FBO (Only when it's time to capture)
        if (shouldCapture) {
            fboManager.initFboIfNeeded(fboW, fboH, useNearest)

            if (fboManager.fboId != 0) {
                fboManager.bind()
                GLES20.glViewport(0, 0, fboManager.fboWidth, fboManager.fboHeight)
                GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
                
                shaderProgram.drawCopy(
                    transformMatrix = transformMatrix,
                    vertexBuffer = vertexBuffer,
                    texCoordBuffer = texCoordBuffer,
                    cameraTextureId = cameraTextureId
                )
                
                fboManager.unbind()
            }
        }

        // Pass 2: FBO -> Screen (Always)
        GLES20.glViewport(0, 0, viewportWidth, viewportHeight)
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)

        matrixCalculator.calculateScaleAndCrop(
            cameraWidth = cameraWidth,
            cameraHeight = cameraHeight,
            viewportWidth = viewportWidth,
            viewportHeight = viewportHeight,
            aspectRatioSetting = currentConfig.aspectRatio,
            outScaleMatrix = scaleMatrix,
            outCropMatrix = cropMatrix
        )

        val activeTextureId = if (fboManager.fboTextureId != 0) fboManager.fboTextureId else cameraTextureId

        shaderProgram.drawMain(
            identityMatrix = identityMatrix,
            scaleMatrix = scaleMatrix,
            cropMatrix = cropMatrix,
            vertexBuffer = vertexBuffer,
            texCoordBuffer = texCoordBuffer,
            textureId = activeTextureId,
            config = currentConfig,
            viewportWidth = viewportWidth,
            viewportHeight = viewportHeight
        )
    }

    override fun onFrameAvailable(surfaceTexture: SurfaceTexture?) {
        listener.requestRender()
    }
    
    fun release() {
        shaderProgram.release()
        fboManager.release()
        timingController.reset()

        if (cameraTextureId != 0) {
            GLES20.glDeleteTextures(1, intArrayOf(cameraTextureId), 0)
            cameraTextureId = 0
        }
        surfaceTexture?.release()
        surfaceTexture = null
    }
}
