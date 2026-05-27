package com.grovkornet.nativefilmcamera

import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher
import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.ui.NativeFilmCameraView
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlin.math.roundToInt

class NativeFilmCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeFilmCamera")

    AsyncFunction("verifyGrovkornetAuthenticity") { uriString: String ->
      val uri = android.net.Uri.parse(uriString)
      com.grovkornet.nativefilmcamera.logic.WatermarkEngine.verifyGrovkornetAuthenticity(appContext.reactContext ?: throw Exception("React context is null"), uri)
    }

    AsyncFunction("generatePresetPreview") { inputUriString: String, payload: Map<String, Any> ->
      kotlinx.coroutines.runBlocking {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        val inputUri = android.net.Uri.parse(inputUriString)
        
        val inputStream = context.contentResolver.openInputStream(inputUri) ?: throw Exception("Failed to open input stream")
        val inputBitmap = android.graphics.BitmapFactory.decodeStream(inputStream) ?: throw Exception("Failed to decode bitmap")
        inputStream.close()
        
        val config = CameraConfiguration().apply {
            (payload["saturation"] as? Number)?.toFloat()?.let { saturation = it }
            (payload["contrast"] as? Number)?.toFloat()?.let { contrast = it }
            (payload["grainIntensity"] as? Number)?.toFloat()?.let { grainIntensity = it }
            (payload["grainChroma"] as? Number)?.toFloat()?.let { grainChroma = it }
            (payload["grainSize"] as? Number)?.toFloat()?.let { grainSize = it }
            (payload["grainSpeed"] as? Number)?.toFloat()?.let { grainSpeed = it }
            (payload["vignetteIntensity"] as? Number)?.toFloat()?.let { vignetteIntensity = it }
            (payload["vhsIntensity"] as? Number)?.toFloat()?.let { vhsIntensity = it }
            ((payload["temperature"] as? Number) ?: (payload["whiteBalance"] as? Number))?.toFloat()?.let { whiteBalance = it }
            (payload["tint"] as? Number)?.toFloat()?.let { tint = it }
            (payload["bloomIntensity"] as? Number)?.toFloat()?.let { bloomIntensity = it }
            (payload["chromaticAberration"] as? Number)?.toFloat()?.let { aberration = it }
            (payload["aberrationDirection"] as? Number)?.toInt()?.let { aberrationDirection = it }
            (payload["sharpening"] as? Number)?.toFloat()?.let { sharpening = it }
            (payload["satRed"] as? Number)?.toFloat()?.let { satRed = it }
            (payload["satOrange"] as? Number)?.toFloat()?.let { satOrange = it }
            (payload["satYellow"] as? Number)?.toFloat()?.let { satYellow = it }
            (payload["satGreen"] as? Number)?.toFloat()?.let { satGreen = it }
            (payload["satCyan"] as? Number)?.toFloat()?.let { satCyan = it }
            (payload["satBlue"] as? Number)?.toFloat()?.let { satBlue = it }
            (payload["satPurple"] as? Number)?.toFloat()?.let { satPurple = it }
            (payload["satMagenta"] as? Number)?.toFloat()?.let { satMagenta = it }
            (payload["aberrationInvert"] as? Boolean)?.let { aberrationInvert = it }
            (payload["boundMagentaRed"] as? Number)?.toFloat()?.let { boundMagentaRed = it }
            (payload["boundRedOrange"] as? Number)?.toFloat()?.let { boundRedOrange = it }
            (payload["boundOrangeYellow"] as? Number)?.toFloat()?.let { boundOrangeYellow = it }
            (payload["boundYellowGreen"] as? Number)?.toFloat()?.let { boundYellowGreen = it }
            (payload["boundGreenCyan"] as? Number)?.toFloat()?.let { boundGreenCyan = it }
            (payload["boundCyanBlue"] as? Number)?.toFloat()?.let { boundCyanBlue = it }
            (payload["boundBluePurple"] as? Number)?.toFloat()?.let { boundBluePurple = it }
            (payload["boundPurpleMagenta"] as? Number)?.toFloat()?.let { boundPurpleMagenta = it }
            (payload["grainEnabled"] as? Boolean)?.let { grainEnabled = it }
            (payload["bloomEnabled"] as? Boolean)?.let { bloomEnabled = it }
        }
        
        val processor = OffscreenFilmProcessor()
        processor.prepare(inputBitmap.width, inputBitmap.height, context.assets)
        val outputBitmap = processor.process(inputBitmap, config, context)
        processor.release()
        
        val cacheDir = context.cacheDir
        val outputFile = java.io.File(cacheDir, "preset_preview_" + java.util.UUID.randomUUID().toString() + ".jpg")
        val outputStream = java.io.FileOutputStream(outputFile)
        outputBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, outputStream)
        outputStream.close()
        
        if (inputBitmap != outputBitmap) {
            inputBitmap.recycle()
        }
        outputBitmap.recycle()
        
        android.net.Uri.fromFile(outputFile).toString()
      }
    }

    AsyncFunction("deleteFile") { uriString: String ->
      try {
        val uri = android.net.Uri.parse(uriString)
        if (uri.scheme == "file") {
          val path = uri.path
          if (path != null) {
            val file = java.io.File(path)
            if (file.exists()) {
              file.delete()
            } else {
              false
            }
          } else {
            false
          }
        } else {
          false
        }
      } catch (e: Exception) {
        false
      }
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

      Prop("grainSpeed") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { grainSpeed = value }
      }

      Prop("vignetteIntensity") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { vignetteIntensity = value }
      }

      Prop("vhsIntensity") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { vhsIntensity = value }
      }

      Prop("ev") { view: NativeFilmCameraView, value: Float ->
        if (view.config.ev != value) view.updateBoth { ev = value }
      }

      Prop("whiteBalance") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { whiteBalance = value }
      }

      Prop("tint") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { tint = value }
      }

      Prop("bloomIntensity") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { bloomIntensity = value }
      }

      Prop("chromaticAberration") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { aberration = value }
      }

      Prop("aberrationDirection") { view: NativeFilmCameraView, value: Int ->
        view.updateEffect { aberrationDirection = value }
      }

      Prop("sharpening") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { sharpening = value }
      }

      Prop("satRed") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satRed = value }
      }

      Prop("satOrange") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satOrange = value }
      }

      Prop("satYellow") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satYellow = value }
      }

      Prop("satGreen") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satGreen = value }
      }

      Prop("satCyan") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satCyan = value }
      }

      Prop("satBlue") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satBlue = value }
      }

      Prop("satPurple") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satPurple = value }
      }

      Prop("satMagenta") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { satMagenta = value }
      }

      Prop("targetFps") { view: NativeFilmCameraView, value: Int ->
        if (view.config.targetFps != value) view.updateBoth { targetFps = value }
      }

      Prop("cameraAspectRatio") { view: NativeFilmCameraView, value: Float ->
        val aspectInt = value.roundToInt()
                      if (view.config.aspectRatio != aspectInt) {
                        view.updateBoth { aspectRatio = aspectInt }
                      }
      }

      Prop("aberrationInvert") { view: NativeFilmCameraView, value: Boolean ->
        view.updateEffect { aberrationInvert = value }
      }

      Prop("boundMagentaRed") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundMagentaRed = value }
      }

      Prop("boundRedOrange") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundRedOrange = value }
      }

      Prop("boundOrangeYellow") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundOrangeYellow = value }
      }

      Prop("boundYellowGreen") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundYellowGreen = value }
      }

      Prop("boundGreenCyan") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundGreenCyan = value }
      }

      Prop("boundCyanBlue") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundCyanBlue = value }
      }

      Prop("boundBluePurple") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundBluePurple = value }
      }

      Prop("boundPurpleMagenta") { view: NativeFilmCameraView, value: Float ->
        view.updateEffect { boundPurpleMagenta = value }
      }

      Prop("grainEnabled") { view: NativeFilmCameraView, value: Boolean ->
        view.updateEffect { grainEnabled = value }
      }

      Prop("bloomEnabled") { view: NativeFilmCameraView, value: Boolean ->
        view.updateEffect { bloomEnabled = value }
      }

      Prop("noiseReduction") { view: NativeFilmCameraView, value: Int ->
        if (view.config.noiseReduction != value) view.updateHardware { noiseReduction = value }
      }

      Prop("isoAuto") { view: NativeFilmCameraView, value: Boolean ->
        if (view.config.isoAuto != value) view.updateHardware { isoAuto = value }
      }

      Prop("shutterSpeedAuto") { view: NativeFilmCameraView, value: Boolean ->
        if (view.config.shutterSpeedAuto != value) view.updateHardware { shutterSpeedAuto = value }
      }

      Prop("whiteBalanceAuto") { view: NativeFilmCameraView, value: Boolean ->
        if (view.config.whiteBalanceAuto != value) view.updateBoth { whiteBalanceAuto = value }
      }

      Prop("autoFocus") { view: NativeFilmCameraView, value: Boolean ->
        if (view.config.autoFocus != value) view.updateHardware { autoFocus = value }
      }

      Prop("iso") { view: NativeFilmCameraView, value: Int ->
        if (view.config.iso != value) view.updateHardware { iso = value }
      }

      Prop("exposureTime") { view: NativeFilmCameraView, value: Double ->
        if (value > 0) {
                        val newTime = (1_000_000_000.0 / value).toLong()
                        if (view.config.exposureTime != newTime) view.updateHardware { exposureTime = newTime }
                      }
      }

      Prop("focusDistance") { view: NativeFilmCameraView, value: Float ->
        if (view.config.focusDistance != value) view.updateHardware { focusDistance = value }
      }

      Prop("torchState") { view: NativeFilmCameraView, value: Float ->
        val enabled = value > 0.5f
                      if (view.config.torchEnabled != enabled) view.updateHardware { torchEnabled = enabled }
      }

      Prop("torchStrength") { view: NativeFilmCameraView, value: Int ->
        val strength = value.toInt()
                      if (view.config.torchStrength != strength) view.updateHardware { torchStrength = strength }
      }

      Prop("cameraId") { view: NativeFilmCameraView, value: String? ->
        if (view.config.cameraId != value) view.updateHardware { cameraId = value }
      }

      Prop("resolutionSetting") { view: NativeFilmCameraView, value: Int ->
        if (view.config.resolutionSetting != value) {
                        view.updateBoth { resolutionSetting = value }
                      }
      }

      Prop("previewIn4k") { view: NativeFilmCameraView, value: Boolean ->
        if (view.config.previewIn4k != value) {
                        view.updateBoth { previewIn4k = value }
                      }
      }
      // @@GEN_PROPS_END@@

      Prop("secureViewEnabled") { view: NativeFilmCameraView, value: Boolean ->
        view.setSecureMode(value)
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
