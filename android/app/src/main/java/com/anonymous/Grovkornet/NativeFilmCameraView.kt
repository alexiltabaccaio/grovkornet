package com.anonymous.Grovkornet

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.util.Log
import android.util.Range
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class NativeFilmCameraView(context: Context) : GLSurfaceView(context), GLSurfaceView.Renderer, SurfaceTexture.OnFrameAvailableListener {

    private val TAG = "NativeFilmCameraView"

    // Props from React Native
    var saturation: Float = 1.0f
    var contrast: Float = 1.0f
    var grainIntensity: Float = 0.0f
    var grainEnabled: Boolean = true
    var aberration: Float = 0.0f

    private var program = 0
    private var cameraTextureId = 0
    private var surfaceTexture: SurfaceTexture? = null

    private var vertexBuffer: FloatBuffer
    private var texCoordBuffer: FloatBuffer

    private val transformMatrix = FloatArray(16)

    private var viewportWidth = 0
    private var viewportHeight = 0
    
    private var cameraWidth = 0
    private var cameraHeight = 0

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
        setEGLContextClientVersion(2)
        setRenderer(this)
        renderMode = RENDERMODE_WHEN_DIRTY

        vertexBuffer = ByteBuffer.allocateDirect(VERTICES.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(VERTICES)
        vertexBuffer.position(0)
        texCoordBuffer = ByteBuffer.allocateDirect(TEX_COORDS.size * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().put(TEX_COORDS)
        texCoordBuffer.position(0)
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        // Usa il vertex shader standard e un fragment shader per OES (External Texture)
        program = GLUtils.createProgram(FilmShader.VERTEX_SHADER, FilmShader.FRAGMENT_SHADER_OES)

        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)
        cameraTextureId = textures[0]

        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)

        surfaceTexture = SurfaceTexture(cameraTextureId)
        surfaceTexture?.setOnFrameAvailableListener(this)

        // Avvia CameraX sul Main Thread
        post {
            startCamera()
        }
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        viewportWidth = width
        viewportHeight = height
        GLES20.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        surfaceTexture?.updateTexImage()
        surfaceTexture?.getTransformMatrix(transformMatrix)

        // Calcola e invia FPS
        val now = System.currentTimeMillis()
        if (lastLogTime == 0L) lastLogTime = now
        framesCount++
        if (now - lastLogTime >= 500) {
            val actualFps = (framesCount * 1000) / (now - lastLogTime)
            val event = Arguments.createMap().apply {
                putInt("fps", actualFps.toInt())
                putString("resolution", "${cameraWidth}x${cameraHeight}")
            }
            val reactContext = context as? ThemedReactContext
            reactContext?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(
                id,
                "onDebugUpdate",
                event
            )
            lastLogTime = now
            framesCount = 0
        }

        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
        GLES20.glUseProgram(program)

        // Pass transform matrix
        val uTransformMatrix = GLES20.glGetUniformLocation(program, "u_TransformMatrix")
        GLES20.glUniformMatrix4fv(uTransformMatrix, 1, false, transformMatrix, 0)

        // Setup Uniforms
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Saturation"), saturation)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Contrast"), contrast)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_AberrationIntensity"), aberration)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainIntensity"), grainIntensity)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_GrainEnabled"), if (grainEnabled) 1.0f else 0.0f)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Time"), (System.currentTimeMillis() % 10000) / 1000f)
        GLES20.glUniform2f(GLES20.glGetUniformLocation(program, "u_Resolution"), viewportWidth.toFloat(), viewportHeight.toFloat())

        val aPosition = GLES20.glGetAttribLocation(program, "a_Position")
        val aTexCoord = GLES20.glGetAttribLocation(program, "a_TexCoord")

        GLES20.glEnableVertexAttribArray(aPosition)
        GLES20.glVertexAttribPointer(aPosition, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(aTexCoord)
        GLES20.glVertexAttribPointer(aTexCoord, 2, GLES20.GL_FLOAT, false, 0, texCoordBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES20.glUniform1i(GLES20.glGetUniformLocation(program, "u_Texture"), 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    override fun onFrameAvailable(surfaceTexture: SurfaceTexture?) {
        requestRender() // Triggera onDrawFrame
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val preview = Preview.Builder()
                .setTargetFrameRate(Range(60, 60))
                .build().also {
                it.setSurfaceProvider { request ->
                    val st = surfaceTexture
                    if (st != null) {
                        cameraWidth = request.resolution.width
                        cameraHeight = request.resolution.height
                        st.setDefaultBufferSize(request.resolution.width, request.resolution.height)
                        val surface = android.view.Surface(st)
                        request.provideSurface(surface, ContextCompat.getMainExecutor(context)) { result ->
                            surface.release()
                        }
                    }
                }
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                
                // Usiamo il ProcessLifecycleOwner che è sempre disponibile e garantito, 
                // aggirando i problemi di contesto di React Native
                val lifecycleOwner = ProcessLifecycleOwner.get()
                
                cameraProvider.bindToLifecycle(lifecycleOwner, cameraSelector, preview)
                Log.i(TAG, "CameraX started successfully using ProcessLifecycleOwner")
            } catch (e: Exception) {
                Log.e(TAG, "Use case binding failed", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }
}
