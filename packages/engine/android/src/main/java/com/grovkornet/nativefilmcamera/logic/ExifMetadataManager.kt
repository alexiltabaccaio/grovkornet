package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.net.Uri
import android.util.Log
import java.io.InputStream

object ExifMetadataManager {
    private const val TAG = "ExifMetadataManager"
    
    private val TAGS_TO_COPY = arrayOf(
        android.media.ExifInterface.TAG_F_NUMBER,
        android.media.ExifInterface.TAG_ISO_SPEED_RATINGS,
        android.media.ExifInterface.TAG_EXPOSURE_TIME,
        android.media.ExifInterface.TAG_FOCAL_LENGTH,
        android.media.ExifInterface.TAG_WHITE_BALANCE,
        android.media.ExifInterface.TAG_FLASH,
        android.media.ExifInterface.TAG_GPS_LATITUDE,
        android.media.ExifInterface.TAG_GPS_LATITUDE_REF,
        android.media.ExifInterface.TAG_GPS_LONGITUDE,
        android.media.ExifInterface.TAG_GPS_LONGITUDE_REF,
        android.media.ExifInterface.TAG_GPS_ALTITUDE,
        android.media.ExifInterface.TAG_GPS_ALTITUDE_REF,
        android.media.ExifInterface.TAG_GPS_PROCESSING_METHOD,
        android.media.ExifInterface.TAG_GPS_TIMESTAMP,
        android.media.ExifInterface.TAG_GPS_DATESTAMP
    )

    fun extractMetadata(inputStream: InputStream): Map<String, String> {
        val originalExifMap = mutableMapOf<String, String>()
        try {
            val originalExif = android.media.ExifInterface(inputStream)
            for (tag in TAGS_TO_COPY) {
                originalExif.getAttribute(tag)?.let { value ->
                    originalExifMap[tag] = value
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read original EXIF metadata", e)
        }
        return originalExifMap
    }

    fun writeMetadata(context: Context, fileUri: Uri, originalTags: Map<String, String>) {
        try {
            context.contentResolver.openFileDescriptor(fileUri, "rw")?.use { pfd ->
                val exif = android.media.ExifInterface(pfd.fileDescriptor)
                val sdf = java.text.SimpleDateFormat("yyyy:MM:dd HH:mm:ss", java.util.Locale.US)
                val now = sdf.format(java.util.Date())
                exif.setAttribute(android.media.ExifInterface.TAG_DATETIME, now)
                exif.setAttribute(android.media.ExifInterface.TAG_DATETIME_ORIGINAL, now)
                exif.setAttribute(android.media.ExifInterface.TAG_DATETIME_DIGITIZED, now)
                exif.setAttribute(android.media.ExifInterface.TAG_SOFTWARE, "Grovkornet Engine")
                exif.setAttribute(android.media.ExifInterface.TAG_MAKE, android.os.Build.MANUFACTURER)
                exif.setAttribute(android.media.ExifInterface.TAG_MODEL, android.os.Build.MODEL)
                exif.setAttribute(android.media.ExifInterface.TAG_RESOLUTION_UNIT, "2")
                exif.setAttribute(android.media.ExifInterface.TAG_X_RESOLUTION, "72/1")
                exif.setAttribute(android.media.ExifInterface.TAG_Y_RESOLUTION, "72/1")
                
                // Copy original EXIF tags back
                for ((tag, value) in originalTags) {
                    exif.setAttribute(tag, value)
                }
                
                exif.saveAttributes()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to write EXIF data to URI: $fileUri", e)
        }
    }
}
