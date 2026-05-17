package com.grovkornet.nativefilmcamera.ui

import com.grovkornet.nativefilmcamera.rendering.FilmRenderer
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

class CameraPropSynchronizer(
    private val config: CameraConfiguration,
    private val renderer: FilmRenderer,
    private val updateScheduler: CameraUpdateScheduler
) {
    var saturation: Float = 1.0f
        set(value) { field = value; config.saturation = value; renderer.saturation = value }
    var contrast: Float = 1.0f
        set(value) { field = value; config.contrast = value; renderer.contrast = value }
    var grainIntensity: Float = 0.0f
        set(value) { field = value; config.grainIntensity = value; renderer.grainIntensity = value }
    var grainChroma: Float = 0.0f
        set(value) { field = value; config.grainChroma = value; renderer.grainChroma = value }
    var grainSize: Float = 1.0f
        set(value) { field = value; config.grainSize = value; renderer.grainSize = value }
    var grainEnabled: Boolean = true
        set(value) { field = value; config.grainEnabled = value; renderer.grainEnabled = value }
    var aberration: Float = 0.0f
        set(value) { field = value; config.aberration = value; renderer.aberration = value }
    var aberrationDirection: Int = 0
        set(value) { field = value; config.aberrationDirection = value; renderer.aberrationDirection = value }
    var ev: Float = 0.0f
        set(value) { field = value; config.ev = value; renderer.ev = value; updateScheduler.schedule() }
    var whiteBalance: Float = 5000.0f
        set(value) { field = value; config.whiteBalance = value; renderer.whiteBalance = value }
    var noiseReduction: Int = 1
        set(value) { field = value; config.noiseReduction = value; updateScheduler.schedule() }
    var sharpening: Float = 0.0f
        set(value) { field = value; config.sharpening = value; renderer.sharpening = value }

    // Hardware Props
    var isoAuto: Boolean = true
        set(value) { field = value; config.isoAuto = value; updateScheduler.schedule() }
    var shutterSpeedAuto: Boolean = true
        set(value) { field = value; config.shutterSpeedAuto = value; updateScheduler.schedule() }
    var whiteBalanceAuto: Boolean = true
        set(value) { field = value; config.whiteBalanceAuto = value; renderer.whiteBalanceAuto = value; updateScheduler.schedule() }
    var autoFocus: Boolean = false
        set(value) { field = value; config.autoFocus = value; updateScheduler.schedule() }
    var iso: Int = 400
        set(value) { field = value; config.iso = value; if (!isoAuto) updateScheduler.schedule() }
    var exposureTime: Long = 1000000000L / 60
        set(value) { field = value; config.exposureTime = value; if (!shutterSpeedAuto) updateScheduler.schedule() }
    var focusDistance: Float = 0.0f
        set(value) { field = value; config.focusDistance = value; if (!autoFocus) updateScheduler.schedule() }
    
    var torchState: Float = 0.0f
        set(value) { field = value; config.torchEnabled = value > 0.5f; updateScheduler.schedule() }
    var torchStrength: Int = 1
        set(value) { field = value; config.torchStrength = value; updateScheduler.schedule() }
    var cameraId: String? = null
        set(value) { field = value; config.cameraId = value; updateScheduler.schedule() }
    var aspectRatio: Int = 1
        set(value) { 
            if (field != value) {
                field = value
                config.aspectRatio = value
                renderer.aspectRatio = value
                updateScheduler.schedule() 
            }
        }

    fun syncConfig() {
        config.saturation = saturation
        config.contrast = contrast
        config.grainIntensity = grainIntensity
        config.grainChroma = grainChroma
        config.grainSize = grainSize
        config.grainEnabled = grainEnabled
        config.aberration = aberration
        config.aberrationDirection = aberrationDirection
        config.whiteBalance = whiteBalance
        config.ev = ev
        config.noiseReduction = noiseReduction
        config.sharpening = sharpening
        config.isoAuto = isoAuto
        config.shutterSpeedAuto = shutterSpeedAuto
        config.whiteBalanceAuto = whiteBalanceAuto
        config.autoFocus = autoFocus
        config.iso = iso
        config.exposureTime = exposureTime
        config.focusDistance = focusDistance
        config.torchEnabled = torchState > 0.5f
        config.torchStrength = torchStrength
        config.cameraId = cameraId
        config.aspectRatio = aspectRatio
        renderer.aspectRatio = aspectRatio
    }
}
