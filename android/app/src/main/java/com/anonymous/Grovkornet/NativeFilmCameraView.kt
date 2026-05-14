package com.anonymous.Grovkornet

import android.content.Context
import android.graphics.SurfaceTexture
import android.opengl.GLSurfaceView
import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class NativeFilmCameraView(context: Context) : GLSurfaceView(context) {

    private lateinit var renderer: FilmRenderer
    private lateinit var cameraEngine: CameraEngine

    init {
        setEGLContextClientVersion(2)
        
        val rendererListener = object : FilmRenderer.Listener {
            override fun onSurfaceTextureCreated(surfaceTexture: SurfaceTexture) {
                post { cameraEngine.start(surfaceTexture) }
            }

            override fun onFpsUpdate(fps: Int, resolution: String) {
                val event = Arguments.createMap().apply {
                    putInt("fps", fps)
                    putString("resolution", resolution)
                }
                emitEvent("onDebugUpdate", event)
            }

            override fun requestRender() {
                this@NativeFilmCameraView.requestRender()
            }
        }

        val cameraListener = object : CameraEngine.Listener {
            override fun onExposureUpdate(iso: Int, shutterSpeed: Double) {
                val event = Arguments.createMap().apply {
                    putInt("iso", iso)
                    putDouble("shutterSpeed", shutterSpeed)
                }
                emitEvent("onExposureUpdate", event)
            }

            override fun onCapabilitiesUpdate(capabilities: WritableMap) {
                emitEvent("onCapabilitiesUpdate", capabilities)
            }

            override fun onCameraResolutionDetected(width: Int, height: Int) {
                renderer.cameraWidth = width
                renderer.cameraHeight = height
            }
        }

        renderer = FilmRenderer(rendererListener)
        cameraEngine = CameraEngine(context, ProcessLifecycleOwner.get(), cameraListener)

        setRenderer(renderer)
        renderMode = RENDERMODE_WHEN_DIRTY
    }

    // Props from React Native
    var saturation: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.saturation = value } }
    var contrast: Float = 1.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.contrast = value } }
    var grainIntensity: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainIntensity = value } }
    var grainEnabled: Boolean = true
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.grainEnabled = value } }
    var aberration: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.aberration = value } }
    var ev: Float = 0.0f
        set(value) { 
            if (field != value) { 
                field = value
                if (::renderer.isInitialized) renderer.ev = value
                if (::cameraEngine.isInitialized) {
                    cameraEngine.ev = value
                    cameraEngine.updateCameraControls()
                }
            } 
        }
    var whiteBalance: Float = 5000.0f
        set(value) { if (field != value) { field = value; if (::renderer.isInitialized) renderer.whiteBalance = value } }

    // Manual Camera Props
    var isoAuto: Boolean = true
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.isoAuto = value; cameraEngine.updateCameraControls() } } }
    var shutterSpeedAuto: Boolean = true
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.shutterSpeedAuto = value; cameraEngine.updateCameraControls() } } }
    var whiteBalanceAuto: Boolean = true
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.whiteBalanceAuto = value; cameraEngine.updateCameraControls() } } }
    var autoFocus: Boolean = false
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.autoFocus = value; cameraEngine.updateCameraControls() } } }
    var iso: Int = 400
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.iso = value; cameraEngine.updateCameraControls() } } }
    var exposureTime: Long = 1000000000L / 60
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.exposureTime = value; cameraEngine.updateCameraControls() } } }
    var focusDistance: Float = 0.0f
        set(value) { if (field != value) { field = value; if (::cameraEngine.isInitialized) { cameraEngine.focusDistance = value; cameraEngine.updateCameraControls() } } }
    
    var cameraId: String? = null
        set(value) {
            if (field != value) {
                field = value
                if (::cameraEngine.isInitialized) cameraEngine.cameraId = value
            }
        }

    private fun emitEvent(name: String, event: WritableMap) {
        val reactContext = context as? ThemedReactContext
        reactContext?.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(id, name, event)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        if (::cameraEngine.isInitialized) cameraEngine.release()
        if (::renderer.isInitialized) renderer.release()
    }
}
