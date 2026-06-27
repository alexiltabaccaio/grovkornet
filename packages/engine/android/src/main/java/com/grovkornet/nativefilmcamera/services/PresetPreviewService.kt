package com.grovkornet.nativefilmcamera.services

import android.content.Context
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.state.loadFromMap
import com.grovkornet.nativefilmcamera.BuildConfig

object PresetPreviewService {
  suspend fun generatePresetPreview(context: Context, inputUriString: String, payload: Map<String, Any>): String {
    if (BuildConfig.DEBUG) {
        android.util.Log.i("PresetPreviewService", ">>> generatePresetPreview called with URI: $inputUriString")
        android.util.Log.i("PresetPreviewService", "Raw JS Payload received: $payload")
    }

    val inputBitmap = ImageIOService.loadBitmapFromUri(context, inputUriString)
    
    val statePtr = com.grovkornet.nativefilmcamera.jni.CameraStateJNI.nativeCopyActiveState()
    val config = CameraConfiguration(statePtr).apply {
        loadFromMap(payload)
    }
    
    if (BuildConfig.DEBUG) {
        android.util.Log.i("PresetPreviewService", "Parsed Configuration: saturation=${config.saturation}, contrast=${config.contrast}, grainEnabled=${config.grainEnabled}, tint=${config.tint}")
    }

    val outputBitmap: android.graphics.Bitmap
    val processor = OffscreenFilmProcessor()
    try {
        processor.prepare(inputBitmap.width, inputBitmap.height, context.assets)
        outputBitmap = processor.process(inputBitmap, config, context)
    } finally {
        processor.release()
        com.grovkornet.nativefilmcamera.jni.CameraStateJNI.nativeFreeState(statePtr)
    }
    
    val outputUriString = ImageIOService.saveBitmapToCache(context, outputBitmap, 90)
    
    if (inputBitmap != outputBitmap) {
        inputBitmap.recycle()
    }
    outputBitmap.recycle()
    
    return outputUriString
  }
}
