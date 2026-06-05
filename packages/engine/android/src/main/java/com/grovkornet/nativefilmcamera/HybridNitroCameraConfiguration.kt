package com.margelo.nitro.com.grovkornet.nativefilmcamera

import com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView

class HybridNitroCameraConfiguration : HybridNitroCameraConfigurationSpec() {
    override var saturation: Double
        get() = NativeFilmCameraView.activeInstance?.config?.saturation?.toDouble() ?: 1.0
        set(value) {
            NativeFilmCameraView.activeInstance?.updateEffect {
                saturation = value.toFloat()
            }
        }
}
