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
import com.grovkornet.nativefilmcamera.errors.CameraErrorFactory
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
      // Initialize Nitro Modules native JNI specs
      com.margelo.nitro.com.grovkornet.nativefilmcamera.grovkornet_engineOnLoad.initializeNative()

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
      com.grovkornet.nativefilmcamera.logic.WatermarkEngine.verifyGrovkornetAuthenticity(appContext.reactContext ?: throw CameraErrorFactory.createCameraBindFailed("React context is null"), uri)
    }

    AsyncFunction("generatePresetPreview") { inputUriString: String, payload: Map<String, Any> ->
      kotlinx.coroutines.runBlocking {
        val context = appContext.reactContext ?: throw CameraErrorFactory.createCameraBindFailed("React context is null")
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
      Prop("ev") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                if (view.config.ev != value) view.updateBoth { ev = value }
              }
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

      Prop("previewQuality") { view: NativeFilmCameraView, value: Int? ->
        value?.let { value ->
                if (view.config.previewQuality != value) {
                          view.updateBoth { previewQuality = value }
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

      Prop("zoom") { view: NativeFilmCameraView, value: Float? ->
        value?.let { value ->
                if (view.config.zoom != value) view.updateHardware { zoom = value }
              }
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
