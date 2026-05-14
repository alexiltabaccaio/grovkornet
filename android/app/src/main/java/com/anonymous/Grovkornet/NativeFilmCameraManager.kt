package com.anonymous.Grovkornet

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder

class NativeFilmCameraManager : SimpleViewManager<NativeFilmCameraView>() {

    override fun getName(): String {
        return "NativeFilmCamera"
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put("onDebugUpdate", MapBuilder.of("registrationName", "onDebugUpdate"))
            .put("onExposureUpdate", MapBuilder.of("registrationName", "onExposureUpdate"))
            .build()
    }

    override fun createViewInstance(reactContext: ThemedReactContext): NativeFilmCameraView {
        return NativeFilmCameraView(reactContext)
    }

    @ReactProp(name = "saturation", defaultFloat = 1.0f)
    fun setSaturation(view: NativeFilmCameraView, saturation: Float) {
        view.saturation = saturation
    }

    @ReactProp(name = "contrast", defaultFloat = 1.0f)
    fun setContrast(view: NativeFilmCameraView, contrast: Float) {
        view.contrast = contrast
    }

    @ReactProp(name = "grainIntensity", defaultFloat = 0.0f)
    fun setGrainIntensity(view: NativeFilmCameraView, grainIntensity: Float) {
        view.grainIntensity = grainIntensity
    }

    @ReactProp(name = "grainEnabled", defaultBoolean = true)
    fun setGrainEnabled(view: NativeFilmCameraView, grainEnabled: Boolean) {
        view.grainEnabled = grainEnabled
    }

    @ReactProp(name = "chromaticAberration", defaultFloat = 0.0f)
    fun setChromaticAberration(view: NativeFilmCameraView, aberration: Float) {
        view.aberration = aberration
    }

    @ReactProp(name = "isoAuto", defaultBoolean = true)
    fun setIsoAuto(view: NativeFilmCameraView, isoAuto: Boolean) {
        view.isoAuto = isoAuto
    }

    @ReactProp(name = "shutterSpeedAuto", defaultBoolean = true)
    fun setShutterSpeedAuto(view: NativeFilmCameraView, shutterSpeedAuto: Boolean) {
        view.shutterSpeedAuto = shutterSpeedAuto
    }

    @ReactProp(name = "whiteBalanceAuto", defaultBoolean = true)
    fun setWhiteBalanceAuto(view: NativeFilmCameraView, whiteBalanceAuto: Boolean) {
        view.whiteBalanceAuto = whiteBalanceAuto
    }

    @ReactProp(name = "autoFocus", defaultBoolean = false)
    fun setAutoFocus(view: NativeFilmCameraView, autoFocus: Boolean) {
        view.autoFocus = autoFocus
    }

    @ReactProp(name = "iso", defaultInt = 400)
    fun setIso(view: NativeFilmCameraView, iso: Int) {
        view.iso = iso
    }

    @ReactProp(name = "exposureTime", defaultDouble = 60.0) // 1/60s
    fun setExposureTime(view: NativeFilmCameraView, exposureTime: Double) {
        if (exposureTime > 0) {
            view.exposureTime = (1_000_000_000.0 / exposureTime).toLong()
        }
    }

    @ReactProp(name = "ev", defaultFloat = 0.0f)
    fun setEv(view: NativeFilmCameraView, ev: Float) {
        view.ev = ev
    }

    @ReactProp(name = "whiteBalance", defaultFloat = 5000.0f)
    fun setWhiteBalance(view: NativeFilmCameraView, whiteBalance: Float) {
        view.whiteBalance = whiteBalance
    }

    @ReactProp(name = "focusDistance", defaultFloat = 0.0f)
    fun setFocusDistance(view: NativeFilmCameraView, focusDistance: Float) {
        view.focusDistance = focusDistance
    }
}
