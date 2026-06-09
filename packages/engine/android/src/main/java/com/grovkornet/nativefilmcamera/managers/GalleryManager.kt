package com.grovkornet.nativefilmcamera.managers

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class GalleryManager(private val context: Context) {
    private val TAG = "GalleryManager"

    fun createGalleryUri(): Uri? {
        val currentTime = System.currentTimeMillis()
        val formatter = SimpleDateFormat("yyyyMMdd_HHmmssSSS", Locale.US)
        val dateString = formatter.format(Date(currentTime))
        val filename = "GVK_${dateString}.jpg"
        
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            put(MediaStore.MediaColumns.DATE_ADDED, currentTime / 1000)
            put(MediaStore.Images.Media.DATE_TAKEN, currentTime)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/Grovkornet")
            }
        }

        return context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
    }

    /**
     * Saves a bitmap to the system gallery using MediaStore.
     */
    fun saveToGallery(bitmap: Bitmap): Uri? {
        val currentTime = System.currentTimeMillis()
        val formatter = SimpleDateFormat("yyyyMMdd_HHmmssSSS", Locale.US)
        val dateString = formatter.format(Date(currentTime))
        val filename = "GVK_${dateString}.jpg"
        
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            put(MediaStore.MediaColumns.DATE_ADDED, currentTime / 1000)
            put(MediaStore.Images.Media.DATE_TAKEN, currentTime)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/Grovkornet")
            }
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
        
        uri?.let {
            try {
                resolver.openOutputStream(it).use { outputStream ->
                    if (outputStream != null) {
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to write bitmap to gallery", e)
                return null
            }
        }
        return uri
    }

    /**
     * Saves an existing file to the system gallery using MediaStore.
     */
    fun saveFileToGallery(file: java.io.File): Uri? {
        val currentTime = System.currentTimeMillis()
        val formatter = SimpleDateFormat("yyyyMMdd_HHmmssSSS", Locale.US)
        val dateString = formatter.format(Date(currentTime))
        val filename = "GVK_${dateString}.jpg"
        
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            put(MediaStore.MediaColumns.DATE_ADDED, currentTime / 1000)
            put(MediaStore.Images.Media.DATE_TAKEN, currentTime)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/Grovkornet")
            }
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
        
        uri?.let {
            try {
                resolver.openOutputStream(it).use { outputStream ->
                    if (outputStream != null) {
                        file.inputStream().use { inputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to write file to gallery", e)
                return null
            }
        }
        return uri
    }
}
