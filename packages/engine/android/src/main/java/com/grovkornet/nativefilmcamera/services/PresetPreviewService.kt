package com.grovkornet.nativefilmcamera.services

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.state.loadFromMap
import com.grovkornet.nativefilmcamera.BuildConfig

object PresetPreviewService {
    private const val TAG = "PresetPreviewService"
    private const val PREVIEW_QUALITY = 90

    suspend fun generatePresetPreview(context: Context, inputUriString: String, payload: Map<String, Any>): String {
        if (BuildConfig.DEBUG) {
            Log.i(TAG, ">>> generatePresetPreview called with URI: $inputUriString")
            Log.i(TAG, "Raw JS Payload received: $payload")
        }

        val inputBitmap = ImageIOService.loadBitmapFromUri(context, inputUriString)
        
        try {
            val statePtr = com.grovkornet.nativefilmcamera.jni.CameraStateJNI.nativeCopyActiveState()
            val config = CameraConfiguration(statePtr).apply {
                loadFromMap(payload)
            }
            
            if (BuildConfig.DEBUG) {
                Log.i(TAG, "Configuration successfully loaded from payload")
            }

            var outputBitmap: Bitmap? = null
            val processor = OffscreenFilmProcessor()
            
            try {
                processor.prepare(inputBitmap.width, inputBitmap.height, context.assets)
                outputBitmap = processor.process(inputBitmap, config, context)
                
                return ImageIOService.saveBitmapToCache(context, outputBitmap, PREVIEW_QUALITY)
            } finally {
                processor.release()
                com.grovkornet.nativefilmcamera.jni.CameraStateJNI.nativeFreeState(statePtr)
                
                if (outputBitmap != null && outputBitmap !== inputBitmap) {
                    outputBitmap.recycle()
                }
            }
        } finally {
            inputBitmap.recycle()
        }
    }
}
