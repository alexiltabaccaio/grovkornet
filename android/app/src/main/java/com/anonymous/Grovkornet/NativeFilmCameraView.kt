package com.anonymous.Grovkornet

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.util.Log
import android.util.Range
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.hardware.camera2.CaptureRequest
import android.hardware.camera2.CameraCaptureSession
import android.hardware.camera2.CaptureResult
import android.hardware.camera2.TotalCaptureResult
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.Camera2Interop
import androidx.camera.camera2.interop.CaptureRequestOptions
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
    var ev: Float = 0.0f
    var whiteBalance: Float = 5000.0f

    // Manual Camera Props
    var isoAuto: Boolean = true
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var shutterSpeedAuto: Boolean = true
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var whiteBalanceAuto: Boolean = true
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var autoFocus: Boolean = false
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var iso: Int = 400
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var exposureTime: Long = 1000000000L / 60
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    var focusDistance: Float = 0.0f
        set(value) { if (field != value) { field = value; updateCameraControls() } }
    
    var cameraId: String? = null
        set(value) {
            if (field != value) {
                field = value
                post { startCamera() }
            }
        }

    private var camera: Camera? = null

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
    private var lastExposureUpdateTime = 0L

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
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_Ev"), ev)
        GLES20.glUniform1f(GLES20.glGetUniformLocation(program, "u_WhiteBalance"), whiteBalance)

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
            val previewBuilder = Preview.Builder()
            
            // Rilevamento dinamico del miglior range FPS supportato dall'hardware
            try {
                val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                val targetId = if (!cameraId.isNullOrEmpty()) cameraId!! else cameraManager.cameraIdList.firstOrNull { 
                    cameraManager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK 
                }
                
                if (targetId != null) {
                    val chars = cameraManager.getCameraCharacteristics(targetId)
                    val fpsRanges = chars.get(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES)
                    if (fpsRanges != null && fpsRanges.isNotEmpty()) {
                        // Trova il range con il massimo upper bound (es. 60fps se supportato, altrimenti 30fps)
                        val bestRange = fpsRanges.maxByOrNull { it.upper }
                        if (bestRange != null) {
                            Log.i(TAG, "Hardware max FPS range detected: $bestRange for camera $targetId")
                            previewBuilder.setTargetFrameRate(bestRange)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error querying hardware capabilities for FPS", e)
            }

            // Selezione dinamica della Risoluzione Massima Supportata
            try {
                val resolutionSelector = androidx.camera.core.resolutionselector.ResolutionSelector.Builder()
                    .setResolutionStrategy(androidx.camera.core.resolutionselector.ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY)
                    .build()
                previewBuilder.setResolutionSelector(resolutionSelector)
                Log.i(TAG, "Hardware max resolution strategy applied")
            } catch (e: Exception) {
                Log.e(TAG, "Error applying resolution selector", e)
            }
            
            // Aggiungi un callback per leggere ISO e Shutter in tempo reale
            Camera2Interop.Extender(previewBuilder).setSessionCaptureCallback(object : CameraCaptureSession.CaptureCallback() {
                override fun onCaptureCompleted(session: CameraCaptureSession, request: CaptureRequest, result: TotalCaptureResult) {
                    val now = System.currentTimeMillis()
                    // Inviamo l'aggiornamento a JS ~10 volte al secondo per non intasare il bridge
                    if (now - lastExposureUpdateTime >= 100) {
                        val currentIso = result.get(CaptureResult.SENSOR_SENSITIVITY) ?: return
                        val currentShutter = result.get(CaptureResult.SENSOR_EXPOSURE_TIME) ?: return
                        
                        // Convertiamo il tempo di esposizione da nanosecondi al denominatore (es. 1/60s)
                        val shutterDenominator = 1_000_000_000.0 / currentShutter.toDouble()

                        val event = Arguments.createMap().apply {
                            putInt("iso", currentIso)
                            putDouble("shutterSpeed", shutterDenominator)
                        }
                        
                        val reactContext = context as? ThemedReactContext
                        reactContext?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(
                            id,
                            "onExposureUpdate",
                            event
                        )
                        lastExposureUpdateTime = now
                    }
                }
            })

            val preview = previewBuilder.build().also {
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

            try {
                cameraProvider.unbindAll()
                
                // Determina quale camera usare
                var selectedSelector = CameraSelector.DEFAULT_BACK_CAMERA
                var targetZoomRatio: Float? = null
                
                if (!cameraId.isNullOrEmpty()) {
                    val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
                    var parentLogicalId: String? = null
                    var isPhysical = false

                    // PRIORITÀ 1: Controlla se l'ID richiesto è una lente fisica figlia di una camera logica
                    for (id in cameraManager.cameraIdList) {
                        val chars = cameraManager.getCameraCharacteristics(id)
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                            val physicalIds = chars.physicalCameraIds
                            if (physicalIds != null && physicalIds.contains(cameraId)) {
                                parentLogicalId = id
                                isPhysical = true
                                break
                            }
                        }
                    }

                    // PRIORITÀ 2: Se non è una lente fisica, allora trattala come camera logica a sé stante
                    if (parentLogicalId == null) {
                        for (id in cameraManager.cameraIdList) {
                            if (id == cameraId) {
                                parentLogicalId = id
                                break
                            }
                        }
                    }

                    if (parentLogicalId != null) {
                        val builder = CameraSelector.Builder()
                        
                        if (isPhysical) {
                            // Calcola lo zoom ratio necessario per simulare o supportare il cambio lente
                            val physChars = cameraManager.getCameraCharacteristics(cameraId!!)
                            val parentChars = cameraManager.getCameraCharacteristics(parentLogicalId)
                            val physFocal = physChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
                            val parentFocal = parentChars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.getOrNull(0)
                            val physSensor = physChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
                            val parentSensor = parentChars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
                            
                            if (physFocal != null && parentFocal != null && physSensor != null && parentSensor != null) {
                                val physDiag = Math.sqrt(Math.pow(physSensor.width.toDouble(), 2.0) + Math.pow(physSensor.height.toDouble(), 2.0))
                                val parentDiag = Math.sqrt(Math.pow(parentSensor.width.toDouble(), 2.0) + Math.pow(parentSensor.height.toDouble(), 2.0))
                                
                                val phys35mm = physFocal * (43.27 / physDiag)
                                val parent35mm = parentFocal * (43.27 / parentDiag)
                                
                                targetZoomRatio = (phys35mm / parent35mm).toFloat()
                                Log.i(TAG, "Calculated target zoom ratio: $targetZoomRatio (phys35: $phys35mm, parent35: $parent35mm)")
                            }

                            // Usa l'API introdotta in CameraX 1.4.0 per forzare la lente fisica tramite la fotocamera madre
                            builder.addCameraFilter { cameras ->
                                cameras.filter { Camera2CameraInfo.from(it).cameraId == parentLogicalId }
                            }
                            builder.setPhysicalCameraId(cameraId!!)
                            Log.i(TAG, "Binding physical lens $cameraId through logical parent $parentLogicalId")
                        } else {
                            // Camera logica o singola
                            builder.addCameraFilter { cameras ->
                                cameras.filter { Camera2CameraInfo.from(it).cameraId == parentLogicalId }
                            }
                            Log.i(TAG, "Binding standalone logical camera $parentLogicalId")
                        }
                        
                        selectedSelector = builder.build()
                    }

                }

                val lifecycleOwner = ProcessLifecycleOwner.get()
                camera = cameraProvider.bindToLifecycle(lifecycleOwner, selectedSelector, preview)
                
                if (targetZoomRatio != null) {
                    // Impostiamo anche il targetZoomRatio perché su Pixel 8 Pro l'HAL potrebbe croppare 
                    // il sensore per matchare il FoV 1.0x se non cambiamo lo zoom
                    camera?.cameraControl?.setZoomRatio(targetZoomRatio)
                }
                
                // Emetti le capacità hardware dopo il binding
                emitCapabilities(cameraProvider)
                
                updateCameraControls()
                Log.i(TAG, "CameraX started successfully using ProcessLifecycleOwner")
            } catch (e: Exception) {
                Log.e(TAG, "Use case binding failed", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun emitCapabilities(cameraProvider: ProcessCameraProvider) {
        val event = Arguments.createMap()
        val camerasList = Arguments.createArray()

        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        try {
            val logicalCameras = cameraManager.cameraIdList
            val addedIds = mutableSetOf<String>()

            for (id in logicalCameras) {
                val characteristics = cameraManager.getCameraCharacteristics(id)
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)
                
                if (facing == CameraCharacteristics.LENS_FACING_BACK) {
                    // Cerca lenti fisiche all'interno della camera logica
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        val physicalIds = characteristics.physicalCameraIds
                        if (physicalIds != null && physicalIds.isNotEmpty()) {
                            for (physId in physicalIds) {
                                if (addedIds.add(physId)) {
                                    val physChars = cameraManager.getCameraCharacteristics(physId)
                                    addCameraToMap(physId, physChars, camerasList)
                                }
                            }
                            continue // Abbiamo aggiunto quelle fisiche, saltiamo la logica
                        }
                    }
                    
                    // Fallback: aggiungi la camera se non ha lenti fisiche figlie
                    if (addedIds.add(id)) {
                        addCameraToMap(id, characteristics, camerasList)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get physical cameras", e)
        }
        
        event.putArray("availableCameras", camerasList)

        // Caratteristiche della camera corrente
        val currentCamera = camera ?: return
        val currentInfo = Camera2CameraInfo.from(currentCamera.cameraInfo)
        
        // Supporto AF
        val afModes = currentInfo.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES)
        val supportsAF = afModes?.any { it != CameraCharacteristics.CONTROL_AF_MODE_OFF } ?: false
        event.putBoolean("supportsFocus", supportsAF)

        // Range ISO
        val isoRange = currentInfo.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE)
        if (isoRange != null) {
            event.putInt("isoMin", isoRange.lower)
            event.putInt("isoMax", isoRange.upper)
        }

        val reactContext = context as? ThemedReactContext
        reactContext?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(id, "onCapabilitiesUpdate", event)
    }

    private fun addCameraToMap(id: String, characteristics: CameraCharacteristics, camerasList: com.facebook.react.bridge.WritableArray) {
        val camMap = Arguments.createMap()
        camMap.putString("id", id)
        
        val focalLengths = characteristics.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)
        val sensorSize = characteristics.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
        
        if (focalLengths != null && sensorSize != null && focalLengths.isNotEmpty()) {
            val focalLength = focalLengths[0]
            camMap.putDouble("focalLength", focalLength.toDouble())
            
            // Calcolo equivalente 35mm
            // Diagonale 35mm = 43.27mm
            val sensorDiagonal = Math.sqrt(Math.pow(sensorSize.width.toDouble(), 2.0) + Math.pow(sensorSize.height.toDouble(), 2.0))
            val cropFactor = 43.27 / sensorDiagonal
            val focalLength35mm = focalLength * cropFactor
            camMap.putInt("focalLength35mm", focalLength35mm.toInt())
        }

        camerasList.pushMap(camMap)
    }

    private fun updateCameraControls() {
        val currentCamera = camera ?: return
        try {
            val camera2CameraControl = Camera2CameraControl.from(currentCamera.cameraControl)
            val builder = CaptureRequestOptions.Builder()
            
            // Forza il range FPS a 60 per evitare che il sensore scenda a 30 quando in manuale
            builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(60, 60))
            
            // Logica per gestire l'auto esposizione parziale
            if (isoAuto && shutterSpeedAuto) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_ON)
                // Quando in AUTO, usiamo l'EV come compensazione dell'esposizione
                // Nota: EV qui è un float, Camera2 si aspetta un intero (indici di compensazione)
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_EXPOSURE_COMPENSATION, ev.toInt())
            } else {
                // Se uno dei due è manuale, forziamo AE_MODE_OFF
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AE_MODE, CaptureRequest.CONTROL_AE_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_SENSITIVITY, iso)
                builder.setCaptureRequestOption(CaptureRequest.SENSOR_EXPOSURE_TIME, exposureTime)
            }

            if (whiteBalanceAuto) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, CaptureRequest.CONTROL_AWB_MODE_AUTO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AWB_MODE, CaptureRequest.CONTROL_AWB_MODE_OFF)
            }

            if (autoFocus) {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)
            } else {
                builder.setCaptureRequestOption(CaptureRequest.CONTROL_AF_MODE, CaptureRequest.CONTROL_AF_MODE_OFF)
                builder.setCaptureRequestOption(CaptureRequest.LENS_FOCUS_DISTANCE, focusDistance)
            }

            camera2CameraControl.captureRequestOptions = builder.build()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to update camera controls", e)
        }
    }
}
