package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.FileOutputStream

@RunWith(AndroidJUnit4::class)
class ExifMetadataManagerTest {

    @Test
    fun testExifExtractionAndWriting() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val cacheDir = context.cacheDir
        
        // 1. Create a dummy solid bitmap and save it as JPEG with some EXIF tags manually injected
        val tempFile = File(cacheDir, "test_exif_input.jpg")
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(Color.BLUE)
        FileOutputStream(tempFile).use { os ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, os)
        }
        bitmap.recycle()
        
        // Manually write initial EXIF attributes using standard ExifInterface
        val initialExif = android.media.ExifInterface(tempFile.absolutePath)
        initialExif.setAttribute(android.media.ExifInterface.TAG_F_NUMBER, "2.8")
        initialExif.setAttribute(android.media.ExifInterface.TAG_ISO_SPEED_RATINGS, "800")
        initialExif.setAttribute(android.media.ExifInterface.TAG_EXPOSURE_TIME, "0.016") // 1/60
        initialExif.setAttribute(android.media.ExifInterface.TAG_FOCAL_LENGTH, "24/1")
        initialExif.saveAttributes()

        // 2. Extract metadata using ExifMetadataManager
        val extractedTags = tempFile.inputStream().use { stream ->
            ExifMetadataManager.extractMetadata(stream)
        }
        
        assertEquals("2.8", extractedTags[android.media.ExifInterface.TAG_F_NUMBER])
        assertEquals("800", extractedTags[android.media.ExifInterface.TAG_ISO_SPEED_RATINGS])
        assertEquals("0.016", extractedTags[android.media.ExifInterface.TAG_EXPOSURE_TIME])
        assertEquals("24/1", extractedTags[android.media.ExifInterface.TAG_FOCAL_LENGTH])

        // 3. Write metadata to a new file using ExifMetadataManager.writeMetadata
        val targetFile = File(cacheDir, "test_exif_output.jpg")
        tempFile.copyTo(targetFile, overwrite = true)
        
        val targetUri = Uri.fromFile(targetFile)
        ExifMetadataManager.writeMetadata(context, targetUri, extractedTags)

        // 4. Verify tags are present in target file
        val finalExif = android.media.ExifInterface(targetFile.absolutePath)
        assertEquals("2.8", finalExif.getAttribute(android.media.ExifInterface.TAG_F_NUMBER))
        assertEquals("800", finalExif.getAttribute(android.media.ExifInterface.TAG_ISO_SPEED_RATINGS))
        assertEquals("0.016", finalExif.getAttribute(android.media.ExifInterface.TAG_EXPOSURE_TIME))
        assertEquals("24/1", finalExif.getAttribute(android.media.ExifInterface.TAG_FOCAL_LENGTH))
        assertEquals("Grovkornet Engine", finalExif.getAttribute(android.media.ExifInterface.TAG_SOFTWARE))

        // Clean up
        tempFile.delete()
        targetFile.delete()
    }
}
