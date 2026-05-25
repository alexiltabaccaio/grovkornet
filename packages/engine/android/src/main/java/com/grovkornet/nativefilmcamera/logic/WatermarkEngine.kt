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
            System.loadLibrary("grovkornet-engine")
        } catch (e: Exception) {
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
        // DCT deep path: decode bitmap and verify signature natively
        try {
            val tempFile = java.io.File(context.cacheDir, "temp_verify_${System.currentTimeMillis()}.jpg")
            context.contentResolver.openInputStream(uri)?.use { input ->
                tempFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            try {
                var bitmap: Bitmap? = null
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    val decoder = android.graphics.BitmapRegionDecoder.newInstance(tempFile.absolutePath)
                    if (decoder != null) {
                        val rect = android.graphics.Rect(0, 0, 64, 64)
                        val options = BitmapFactory.Options().apply {
                            inPreferredConfig = Bitmap.Config.ARGB_8888
                        }
                        bitmap = decoder.decodeRegion(rect, options)
                        decoder.recycle()
                    }
                } else {
                    @Suppress("DEPRECATION")
                    val decoder = android.graphics.BitmapRegionDecoder.newInstance(tempFile.absolutePath, false)
                    if (decoder != null) {
                        val rect = android.graphics.Rect(0, 0, 64, 64)
                        val options = BitmapFactory.Options().apply {
                            inPreferredConfig = Bitmap.Config.ARGB_8888
                        }
                        bitmap = decoder.decodeRegion(rect, options)
                        decoder.recycle()
                    }
                }
                
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
