package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log

object WatermarkEngine {
    private const val TAG = "WatermarkEngine"

    init {
        try {
            System.loadLibrary("grovkornet_engine")
        } catch (e: Throwable) {
            Log.e(TAG, "Failed to load grovkornet-engine library", e)
        }
    }

    @JvmStatic
    private external fun nativeEmbedSignature(bitmap: Bitmap): Boolean

    @JvmStatic
    private external fun nativeVerifySignature(bitmap: Bitmap): Boolean

    fun embedSignature(bitmap: Bitmap): Bitmap {
        val success = nativeEmbedSignature(bitmap)
        if (!success) {
            Log.e(TAG, "Failed to embed watermark signature natively")
        }
        return bitmap
    }

    fun verifyGrovkornetAuthenticity(context: Context, uri: Uri): Boolean {
        try {
            val tempFile = java.io.File(context.cacheDir, "temp_verify_${System.currentTimeMillis()}.jpg")
            context.contentResolver.openInputStream(uri)?.use { input ->
                tempFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            try {
                // 1. Fast Path: Check EXIF Software metadata
                try {
                    val exif = android.media.ExifInterface(tempFile.absolutePath)
                    val software = exif.getAttribute(android.media.ExifInterface.TAG_SOFTWARE)
                    if (software != null && software.startsWith("Grovkornet")) {
                        return true
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to read EXIF software metadata", e)
                }

                // 2. Fallback: DCT deep path on full image
                val options = BitmapFactory.Options().apply {
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }
                val bitmap = BitmapFactory.decodeFile(tempFile.absolutePath, options)
                if (bitmap == null) {
                    return false
                }
                val result = nativeVerifySignature(bitmap)
                bitmap.recycle()
                return result
            } finally {
                if (tempFile.exists()) {
                    tempFile.delete()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Authenticity verification failed with exception", e)
        }
        return false
    }
}
