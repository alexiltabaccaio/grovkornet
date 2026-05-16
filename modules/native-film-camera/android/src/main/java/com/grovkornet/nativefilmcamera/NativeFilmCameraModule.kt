package com.grovkornet.nativefilmcamera

import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher
import com.grovkornet.nativefilmcamera.rendering.FilmRenderer
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView
import kotlin.math.roundToInt

class NativeFilmCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeFilmCamera")

    View(NativeFilmCameraView::class) {
      Events(
        "onDebugUpdate",
        "onExposureUpdate",
        "onCapabilitiesUpdate",
        "onPhotoCaptured"
      )

      Prop("saturation") { view: NativeFilmCameraView, saturation: Float ->
        view.saturation = saturation
      }
      Prop("contrast") { view: NativeFilmCameraView, contrast: Float ->
        view.contrast = contrast
      }
      Prop("grainIntensity") { view: NativeFilmCameraView, grainIntensity: Float ->
        view.grainIntensity = grainIntensity
      }
      Prop("grainChroma") { view: NativeFilmCameraView, grainChroma: Float ->
        view.grainChroma = grainChroma
      }
      Prop("grainSize") { view: NativeFilmCameraView, grainSize: Float ->
        view.grainSize = grainSize
      }
      Prop("grainEnabled") { view: NativeFilmCameraView, grainEnabled: Boolean ->
        view.grainEnabled = grainEnabled
      }
      Prop("chromaticAberration") { view: NativeFilmCameraView, aberration: Float ->
        view.aberration = aberration
      }
      Prop("aberrationDirection") { view: NativeFilmCameraView, direction: Int ->
        view.aberrationDirection = direction
      }
      Prop("isoAuto") { view: NativeFilmCameraView, isoAuto: Boolean ->
        view.isoAuto = isoAuto
      }
      Prop("shutterSpeedAuto") { view: NativeFilmCameraView, shutterSpeedAuto: Boolean ->
        view.shutterSpeedAuto = shutterSpeedAuto
      }
      Prop("whiteBalanceAuto") { view: NativeFilmCameraView, whiteBalanceAuto: Boolean ->
        view.whiteBalanceAuto = whiteBalanceAuto
      }
      Prop("autoFocus") { view: NativeFilmCameraView, autoFocus: Boolean ->
        view.autoFocus = autoFocus
      }
      Prop("iso") { view: NativeFilmCameraView, iso: Int ->
        view.iso = iso
      }
      Prop("exposureTime") { view: NativeFilmCameraView, exposureTime: Double ->
        if (exposureTime > 0) {
          view.exposureTime = (1_000_000_000.0 / exposureTime).toLong()
        }
      }
      Prop("ev") { view: NativeFilmCameraView, ev: Float ->
        view.ev = ev
      }
      Prop("whiteBalance") { view: NativeFilmCameraView, whiteBalance: Float ->
        view.whiteBalance = whiteBalance
      }
      Prop("focusDistance") { view: NativeFilmCameraView, focusDistance: Float ->
        view.focusDistance = focusDistance
      }
      Prop("noiseReduction") { view: NativeFilmCameraView, noiseReduction: Int ->
        view.noiseReduction = noiseReduction
      }
      Prop("sharpening") { view: NativeFilmCameraView, sharpening: Float ->
        view.sharpening = sharpening
      }
      Prop("cameraId") { view: NativeFilmCameraView, cameraId: String? ->
        view.cameraId = cameraId
      }
      Prop("torchState") { view: NativeFilmCameraView, torchState: Float ->
        view.torchState = torchState
      }
      Prop("torchStrength") { view: NativeFilmCameraView, torchStrength: Float ->
        view.torchStrength = torchStrength.toInt()
      }
      Prop("aspectRatio") { view: NativeFilmCameraView, aspectRatio: Float ->
        view.aspectRatio = aspectRatio.roundToInt()
      }

      AsyncFunction("takePhoto") { view: NativeFilmCameraView ->
        view.takePhoto()
      }
      
      OnViewDestroys { view: NativeFilmCameraView ->
        view.release()
      }
    }
  }
}
