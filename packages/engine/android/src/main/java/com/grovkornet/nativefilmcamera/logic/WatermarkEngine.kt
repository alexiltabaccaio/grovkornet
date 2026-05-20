package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.media.ExifInterface
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

    fun addExifMetadata(context: Context, uri: Uri) {
        try {
            context.contentResolver.openFileDescriptor(uri, "rw")?.use { pfd ->
                val exif = ExifInterface(pfd.fileDescriptor)
                exif.setAttribute(ExifInterface.TAG_SOFTWARE, "Grovkornet")
                exif.saveAttributes()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to inject EXIF metadata", e)
        }
    }

    fun verifyGrovkornetAuthenticity(context: Context, uri: Uri): Boolean {
        try {
            // EXIF fast path: check software tag first
            context.contentResolver.openInputStream(uri)?.use { input ->
                val exif = ExifInterface(input)
                val software = exif.getAttribute(ExifInterface.TAG_SOFTWARE)
                if (software == "Grovkornet") {
                    return true
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "EXIF fast path verification failed, trying deep DCT verification", e)
        }

        // DCT deep path: decode bitmap and verify signature natively
        try {
            val tempFile = java.io.File(context.cacheDir, "temp_verify_${System.currentTimeMillis()}.jpg")
            context.contentResolver.openInputStream(uri)?.use { input ->
                tempFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            try {
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
