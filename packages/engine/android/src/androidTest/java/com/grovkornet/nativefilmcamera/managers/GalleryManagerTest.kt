package com.grovkornet.nativefilmcamera.managers

import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.grovkornet.nativefilmcamera.logic.ExifMetadataManager
import com.grovkornet.nativefilmcamera.logic.WatermarkEngine
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class GalleryManagerTest {

    @Test
    fun testSaveToGalleryAndMetadataIntegration() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val galleryManager = GalleryManager(context)

        // 1. Create a dummy test bitmap (solid Blue color)
        val width = 100
        val height = 100
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(Color.BLUE)

        // 2. Save the bitmap using GalleryManager
        val savedUri = galleryManager.saveToGallery(bitmap)
        bitmap.recycle()

        assertNotNull("Saved URI should not be null", savedUri)
        assertTrue("Saved URI must be a content URI, got: $savedUri", savedUri.toString().startsWith("content://"))

        try {
            // 3. Verify that before writing EXIF metadata, authenticity verification fails
            // because the default saved bitmap doesn't have the Grovkornet software tag yet.
            val preVerify = WatermarkEngine.verifyGrovkornetAuthenticity(context, savedUri!!)
            assertFalse("Authenticity check should fail prior to writing EXIF metadata", preVerify)

            // 4. Write custom EXIF metadata to the MediaStore URI
            val tagsToInject = mapOf(
                android.media.ExifInterface.TAG_ISO_SPEED_RATINGS to "800",
                android.media.ExifInterface.TAG_EXPOSURE_TIME to "0.0166"
            )
            ExifMetadataManager.writeMetadata(context, savedUri, tagsToInject)

            // 5. Verify authenticity now succeeds since ExifMetadataManager.writeMetadata embeds the "Grovkornet Engine" software tag.
            val postVerify = WatermarkEngine.verifyGrovkornetAuthenticity(context, savedUri)
            assertTrue("Authenticity check must pass after writing Grovkornet EXIF metadata", postVerify)

            // 6. Double check that custom tags were successfully written and can be read back
            context.contentResolver.openFileDescriptor(savedUri, "r")?.use { pfd ->
                val exif = android.media.ExifInterface(pfd.fileDescriptor)
                assertEquals("800", exif.getAttribute(android.media.ExifInterface.TAG_ISO_SPEED_RATINGS))
                assertEquals("0.0166", exif.getAttribute(android.media.ExifInterface.TAG_EXPOSURE_TIME))
                assertEquals("Grovkornet Engine", exif.getAttribute(android.media.ExifInterface.TAG_SOFTWARE))
            }
        } finally {
            // 7. Cleanup: Delete the image from MediaStore
            val deletedRows = context.contentResolver.delete(savedUri!!, null, null)
            assertTrue("Created MediaStore item should be deleted, deleted rows: $deletedRows", deletedRows >= 0)
        }
    }
}
