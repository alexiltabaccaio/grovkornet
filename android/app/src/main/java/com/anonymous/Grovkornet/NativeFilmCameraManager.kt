package com.anonymous.Grovkornet

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class NativeFilmCameraManager : SimpleViewManager<NativeFilmCameraView>() {

    override fun getName(): String {
        return "NativeFilmCamera"
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
}
