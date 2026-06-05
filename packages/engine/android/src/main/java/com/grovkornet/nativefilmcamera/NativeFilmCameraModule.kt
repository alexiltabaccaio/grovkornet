package com.grovkornet.nativefilmcamera

import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.errors.CameraCodedException
import com.grovkornet.nativefilmcamera.errors.CameraErrorCode
import com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlin.math.roundToInt

class NativeFilmCameraModule : Module() {
  private var deviceHealthManager: com.grovkornet.nativefilmcamera.managers.DeviceHealthManager? = null

  override fun definition() = ModuleDefinition {
    Name("NativeFilmCamera")

    Events("onDeviceHealthUpdate")

    OnCreate {
      val ctx = appContext.reactContext ?: return@OnCreate
      deviceHealthManager = com.grovkornet.nativefilmcamera.managers.DeviceHealthManager(
        ctx,
        onDeviceHealthUpdate = { thermalState, isLowRam ->
          this@NativeFilmCameraModule.sendEvent("onDeviceHealthUpdate", mapOf(
            "thermalState" to thermalState,
            "isLowRam" to isLowRam
          ))
        }
      ).apply {
        register()
      }
    }

    OnDestroy {
      deviceHealthManager?.unregister()
      deviceHealthManager = null
    }

    AsyncFunction("verifyGrovkornetAuthenticity") { uriString: String ->
      val uri = android.net.Uri.parse(uriString)
      com.grovkornet.nativefilmcamera.logic.WatermarkEngine.verifyGrovkornetAuthenticity(appContext.reactContext ?: throw CameraCodedException(CameraErrorCode.E_CAMERA_BIND_FAILED, "React context is null"), uri)
    }

    AsyncFunction("generatePresetPreview") { inputUriString: String, payload: Map<String, Any> ->
      kotlinx.coroutines.runBlocking {
        val context = appContext.reactContext ?: throw CameraCodedException(CameraErrorCode.E_CAMERA_BIND_FAILED, "React context is null")
        com.grovkornet.nativefilmcamera.services.PresetPreviewService.generatePresetPreview(context, inputUriString, payload)
      }
    }

    AsyncFunction("deleteFile") { uriString: String ->
      com.grovkornet.nativefilmcamera.services.FileSystemService.deleteFile(uriString)
    }

    View(NativeFilmCameraView::class) {
      Events(
        "onDebugUpdate",
        "onExposureUpdate",
        "onCapabilitiesUpdate",
        "onPhotoCaptured",
        "onTorchStateChanged"
      )

      // @@GEN_PROPS_START@@
      Prop("saturation") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { saturation = it } }
      }

      Prop("contrast") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { contrast = it } }
      }

      Prop("grainIntensity") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { grainIntensity = it } }
      }

      Prop("grainChroma") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { grainChroma = it } }
      }

      Prop("grainSize") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { grainSize = it } }
      }

      Prop("grainSpeed") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { grainSpeed = it } }
      }

      Prop("vignetteIntensity") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { vignetteIntensity = it } }
      }

      Prop("chromaShift") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { chromaShift = it } }
      }

      Prop("ev") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                if (view.config.ev != value) view.updateBoth { ev = value }
              }
      }

      Prop("whiteBalance") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { whiteBalance = it } }
      }

      Prop("tint") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { tint = it } }
      }

      Prop("bloomIntensity") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { bloomIntensity = it } }
      }

      Prop("chromaticAberration") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { aberration = it } }
      }

      Prop("chromaShiftDirection") { view: NativeFilmCameraView, value: Int? ->
        value?.let { view.updateEffect { chromaShiftDirection = it } }
      }

      Prop("sharpening") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { sharpening = it } }
      }

      Prop("satRed") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satRed = it } }
      }

      Prop("satOrange") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satOrange = it } }
      }

      Prop("satYellow") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satYellow = it } }
      }

      Prop("satGreen") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satGreen = it } }
      }

      Prop("satCyan") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satCyan = it } }
      }

      Prop("satBlue") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satBlue = it } }
      }

      Prop("satPurple") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satPurple = it } }
      }

      Prop("satMagenta") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { satMagenta = it } }
      }

      Prop("targetFps") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                if (view.config.targetFps != value) view.updateBoth { targetFps = value }
              }
      }

      Prop("cameraAspectRatio") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                val aspectInt = value.roundToInt()
                        if (view.config.aspectRatio != aspectInt) {
                          view.updateBoth { aspectRatio = aspectInt }
                        }
              }
      }

      Prop("aberrationInvert") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { aberrationInvert = it } }
      }

      Prop("boundMagentaRed") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundMagentaRed = it } }
      }

      Prop("boundRedOrange") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundRedOrange = it } }
      }

      Prop("boundOrangeYellow") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundOrangeYellow = it } }
      }

      Prop("boundYellowGreen") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundYellowGreen = it } }
      }

      Prop("boundGreenCyan") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundGreenCyan = it } }
      }

      Prop("boundCyanBlue") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundCyanBlue = it } }
      }

      Prop("boundBluePurple") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundBluePurple = it } }
      }

      Prop("boundPurpleMagenta") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { boundPurpleMagenta = it } }
      }

      Prop("grainRoughness") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { grainRoughness = it } }
      }

      Prop("panelY") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { panelY = it } }
      }

      Prop("grainEnabled") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { grainEnabled = it } }
      }

      Prop("bloomEnabled") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { bloomEnabled = it } }
      }

      Prop("noiseReduction") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                if (view.config.noiseReduction != value) view.updateHardware { noiseReduction = value }
              }
      }

      Prop("isoAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.isoAuto != value) view.updateHardware { isoAuto = value }
              }
      }

      Prop("shutterSpeedAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.shutterSpeedAuto != value) view.updateHardware { shutterSpeedAuto = value }
              }
      }

      Prop("whiteBalanceAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.whiteBalanceAuto != value) view.updateBoth { whiteBalanceAuto = value }
              }
      }

      Prop("autoFocus") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.autoFocus != value) view.updateHardware { autoFocus = value }
              }
      }

      Prop("iso") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                if (view.config.iso != value) view.updateHardware { iso = value }
              }
      }

      Prop("exposureTime") { view: NativeFilmCameraView, value: Double? ->
        value?.let { value ->
                if (value > 0) {
                          val newTime = (1_000_000_000.0 / value).toLong()
                          if (view.config.exposureTime != newTime) view.updateHardware { exposureTime = newTime }
                        }
              }
      }

      Prop("focusDistance") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                if (view.config.focusDistance != value) view.updateHardware { focusDistance = value }
              }
      }

      Prop("torchState") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                val enabled = value > 0.5f
                        if (view.config.torchEnabled != enabled) view.updateHardware { torchEnabled = enabled }
              }
      }

      Prop("torchStrength") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                val strength = value.toInt()
                        if (view.config.torchStrength != strength) view.updateHardware { torchStrength = strength }
              }
      }

      Prop("cameraId") { view: NativeFilmCameraView, value: String? ->
        value?.let { value ->
                if (view.config.cameraId != value) view.updateHardware { cameraId = value }
              }
      }

      Prop("resolutionSetting") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                if (view.config.resolutionSetting != value) {
                          view.updateBoth { resolutionSetting = value }
                        }
              }
      }

      Prop("previewIn4k") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.previewIn4k != value) {
                          view.updateBoth { previewIn4k = value }
                        }
              }
      }

      Prop("force4k60fpsCrop") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.force4k60fpsCrop != value) {
                          view.updateBoth { force4k60fpsCrop = value }
                        }
              }
      }

      Prop("secureViewEnabled") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                view.setSecureMode(value)
              }
      }

      Prop("isSelfieCamera") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { value ->
                if (view.config.isSelfieCamera != value) view.updateHardware { isSelfieCamera = value }
              }
      }

      Prop("blackLevel") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { blackLevel = it } }
      }

      Prop("highlights") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { highlights = it } }
      }

      Prop("pivot") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { pivot = it } }
      }

      Prop("contrastAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { contrastAuto = it } }
      }

      Prop("blackLevelAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { blackLevelAuto = it } }
      }

      Prop("highlightsAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { highlightsAuto = it } }
      }

      Prop("pivotAuto") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { pivotAuto = it } }
      }

      Prop("zoom") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                if (view.config.zoom != value) view.updateHardware { zoom = value }
              }
      }

      Prop("pixelationFactor") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { pixelationFactor = it } }
      }

      Prop("tapeJitter") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { tapeJitter = it } }
      }

      Prop("scanlines") { view: NativeFilmCameraView, value: Float? ->
        value?.let { view.updateEffect { scanlines = it } }
      }

      Prop("chromaShiftInvert") { view: NativeFilmCameraView, value: Boolean? ->
        value?.let { view.updateEffect { chromaShiftInvert = it } }
      }
      // @@GEN_PROPS_END@@

      AsyncFunction("takePhoto") { view: NativeFilmCameraView ->
        view.takePhoto()
      }
      
      OnViewDestroys { view: NativeFilmCameraView ->
        view.release()
      }
    }
  }
}
