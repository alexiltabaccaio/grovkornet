package com.grovkornet.nativefilmcamera.services

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

object PresetPreviewService {
  suspend fun generatePresetPreview(context: Context, inputUriString: String, payload: Map<String, Any>): String {
    android.util.Log.i("PresetPreviewService", ">>> generatePresetPreview called with URI: $inputUriString")
    android.util.Log.i("PresetPreviewService", "Raw JS Payload received: $payload")

    val inputStream = if (inputUriString.startsWith("http") || inputUriString.startsWith("file") || inputUriString.startsWith("content")) {
        val inputUri = Uri.parse(inputUriString)
        context.contentResolver.openInputStream(inputUri) ?: throw Exception("Failed to open URI stream: $inputUriString")
    } else {
        val resId = context.resources.getIdentifier(inputUriString, "drawable", context.packageName)
        if (resId == 0) throw Exception("Drawable resource not found: $inputUriString")
        context.resources.openRawResource(resId)
    }
    
    val inputBitmap = BitmapFactory.decodeStream(inputStream) ?: throw Exception("Failed to decode bitmap")
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
        (payload["blackLevel"] as? Number)?.toFloat()?.let { blackLevel = it }
        (payload["highlights"] as? Number)?.toFloat()?.let { highlights = it }
        (payload["pivot"] as? Number)?.toFloat()?.let { pivot = it }
        (payload["contrastAuto"] as? Boolean)?.let { contrastAuto = it }
        (payload["blackLevelAuto"] as? Boolean)?.let { blackLevelAuto = it }
        (payload["highlightsAuto"] as? Boolean)?.let { highlightsAuto = it }
        (payload["pivotAuto"] as? Boolean)?.let { pivotAuto = it }
    }
    
    android.util.Log.i("PresetPreviewService", "Parsed Configuration: saturation=${config.saturation}, contrast=${config.contrast}, grainEnabled=${config.grainEnabled}, tint=${config.tint}")

    val processor = OffscreenFilmProcessor()
    processor.prepare(inputBitmap.width, inputBitmap.height, context.assets)
    val outputBitmap = processor.process(inputBitmap, config, context)
    processor.release()
    
    val cacheDir = context.cacheDir
    val outputFile = File(cacheDir, "preset_preview_" + UUID.randomUUID().toString() + ".jpg")
    val outputStream = FileOutputStream(outputFile)
    outputBitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
    outputStream.close()
    
    if (inputBitmap != outputBitmap) {
        inputBitmap.recycle()
    }
    outputBitmap.recycle()
    
    return Uri.fromFile(outputFile).toString()
  }
}
