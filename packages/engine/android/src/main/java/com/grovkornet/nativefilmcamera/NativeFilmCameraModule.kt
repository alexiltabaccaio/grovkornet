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

    AsyncFunction("verifyGrovkornetAuthenticity") { uriString: String ->
      val uri = android.net.Uri.parse(uriString)
      com.grovkornet.nativefilmcamera.logic.WatermarkEngine.verifyGrovkornetAuthenticity(appContext.reactContext ?: throw Exception("React context is null"), uri)
    }

    View(NativeFilmCameraView::class) {
      Events(
        "onDebugUpdate",
        "onExposureUpdate",
        "onCapabilitiesUpdate",
        "onPhotoCaptured"
      )

      Prop("saturation") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { saturation = value }
      }
      Prop("contrast") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { contrast = value }
      }
      Prop("grainIntensity") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { grainIntensity = value }
      }
      Prop("grainChroma") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { grainChroma = value }
      }
      Prop("grainSize") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { grainSize = value }
      }
      Prop("grainEnabled") { view: NativeFilmCameraView, value: Boolean ->
        view.updateEffect { grainEnabled = value }
      }
      Prop("chromaticAberration") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { aberration = value }
      }
      Prop("aberrationDirection") { view: NativeFilmCameraView, value: Int ->
        view.updateEffect { aberrationDirection = value }
      }
      Prop("isoAuto") { view: NativeFilmCameraView, value: Boolean ->
        view.updateHardware { isoAuto = value }
      }
      Prop("shutterSpeedAuto") { view: NativeFilmCameraView, value: Boolean ->
        view.updateHardware { shutterSpeedAuto = value }
      }
      Prop("whiteBalanceAuto") { view: NativeFilmCameraView, value: Boolean ->
        view.updateBoth { whiteBalanceAuto = value }
      }
      Prop("autoFocus") { view: NativeFilmCameraView, value: Boolean ->
        view.updateHardware { autoFocus = value }
      }
      Prop("iso") { view: NativeFilmCameraView, value: Int ->
        view.updateHardware { iso = value }
      }
      Prop("exposureTime") { view: NativeFilmCameraView, value: Double ->
        if (value > 0) {
          view.updateHardware { exposureTime = (1_000_000_000.0 / value).toLong() }
        }
      }
      Prop("ev") { view: NativeFilmCameraView, value: Float ->
        view.updateBoth { ev = value }
      }
      Prop("whiteBalance") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { whiteBalance = value }
      }
      Prop("tint") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { tint = value }
      }
      Prop("focusDistance") { view: NativeFilmCameraView, value: Float ->
        view.updateHardware { focusDistance = value }
      }
      Prop("noiseReduction") { view: NativeFilmCameraView, value: Int ->
        view.updateHardware { noiseReduction = value }
      }
      Prop("sharpening") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { sharpening = value }
      }
      Prop("cameraId") { view: NativeFilmCameraView, value: String? ->
        view.updateHardware { cameraId = value }
      }
      Prop("torchState") { view: NativeFilmCameraView, value: Float ->
        view.updateHardware { torchEnabled = value > 0.5f }
      }
      Prop("torchStrength") { view: NativeFilmCameraView, value: Float ->
        view.updateHardware { torchStrength = value.toInt() }
      }
      Prop("aspectRatio") { view: NativeFilmCameraView, value: Float ->
        val aspectInt = value.roundToInt()
        if (view.config.aspectRatio != aspectInt) {
          view.updateBoth { aspectRatio = aspectInt }
        }
      }
      Prop("targetFps") { view: NativeFilmCameraView, value: Int ->
        view.updateBoth { targetFps = value }
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
