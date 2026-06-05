package com.grovkornet.nativefilmcamera.services

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import com.grovkornet.nativefilmcamera.errors.CameraCodedException
import com.grovkornet.nativefilmcamera.errors.CameraErrorCode
import com.grovkornet.nativefilmcamera.errors.CameraErrorFactory
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

object ImageIOService {
    fun loadBitmapFromUri(context: Context, uriString: String): Bitmap {
        val inputStream = if (uriString.startsWith("http") || uriString.startsWith("file") || uriString.startsWith("content")) {
            val inputUri = Uri.parse(uriString)
            context.contentResolver.openInputStream(inputUri) 
                ?: throw CameraErrorFactory.createPresetPreviewFailed("Failed to open URI stream: $uriString")
        } else {
            val resId = context.resources.getIdentifier(uriString, "drawable", context.packageName)
            if (resId == 0) throw CameraErrorFactory.createPresetPreviewFailed("Drawable resource not found: $uriString")
            context.resources.openRawResource(resId)
        }
        
        val bitmap = BitmapFactory.decodeStream(inputStream) 
            ?: throw CameraErrorFactory.createPresetPreviewFailed("Failed to decode bitmap")
        inputStream.close()
        return bitmap
    }

    fun saveBitmapToCache(context: Context, bitmap: Bitmap, quality: Int = 90): String {
        val cacheDir = context.cacheDir
        val outputFile = File(cacheDir, "preset_preview_" + UUID.randomUUID().toString() + ".jpg")
        FileOutputStream(outputFile).use { os ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, os)
        }
        return Uri.fromFile(outputFile).toString()
    }
}
