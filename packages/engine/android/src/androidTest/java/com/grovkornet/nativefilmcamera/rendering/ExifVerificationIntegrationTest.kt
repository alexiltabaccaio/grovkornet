package com.grovkornet.nativefilmcamera.rendering

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
import java.io.File
import java.io.FileOutputStream

@RunWith(AndroidJUnit4::class)
class ExifVerificationIntegrationTest {

    @Test
    fun testAuthenticityVerificationRoundTrip() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val cacheDir = context.cacheDir

        // 1. Create a dummy solid JPEG file
        val tempFile = File(cacheDir, "exif_verify_test_${System.currentTimeMillis()}.jpg")
        val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
        bitmap.eraseColor(Color.GREEN)
        FileOutputStream(tempFile).use { os ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, os)
        }
        bitmap.recycle()

        val fileUri = Uri.fromFile(tempFile)

        // 2. Initially, the file should NOT be verified because it lacks the "Grovkornet Engine" Software tag
        val beforeVerification = WatermarkEngine.verifyGrovkornetAuthenticity(context, fileUri)
        assertFalse("File without Grovkornet EXIF software tag should fail authenticity check", beforeVerification)

        // 3. Write metadata to the file, which embeds the "Grovkornet Engine" tag
        val originalTags = mapOf<String, String>()
        ExifMetadataManager.writeMetadata(context, fileUri, originalTags)

        // 4. Now, the file should be successfully verified
        val afterVerification = WatermarkEngine.verifyGrovkornetAuthenticity(context, fileUri)
        assertTrue("File with Grovkornet EXIF software tag must pass authenticity check", afterVerification)

        // 5. Clean up
        if (tempFile.exists()) {
            tempFile.delete()
        }
    }
}
