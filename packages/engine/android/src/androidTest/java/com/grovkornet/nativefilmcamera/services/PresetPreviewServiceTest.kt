package com.grovkornet.nativefilmcamera.services

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
class PresetPreviewServiceTest {

    @Test
    fun testGeneratePresetPreview() {
        kotlinx.coroutines.runBlocking {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val cacheDir = context.cacheDir
            
            // Create a dummy solid input bitmap (Red color)
            val width = 64
            val height = 64
            val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            inputBitmap.eraseColor(Color.RED)
            
            // Save dummy bitmap to a temporary file
            val tempFile = File(cacheDir, "test_input_image.jpg")
            FileOutputStream(tempFile).use { os ->
                inputBitmap.compress(Bitmap.CompressFormat.JPEG, 90, os)
            }
            inputBitmap.recycle()
            
            val inputUriString = Uri.fromFile(tempFile).toString()
            val payload = mapOf(
                "saturation" to 1.0f,
                "contrast" to 1.0f,
                "temperature" to 5000.0f,
                "tint" to 0.0f
            )
            
            // Execute the service
            val outputUriString = PresetPreviewService.generatePresetPreview(context, inputUriString, payload)
            
            assertNotNull(outputUriString)
            assertTrue(outputUriString.startsWith("file://"))
            
            val outputFile = File(Uri.parse(outputUriString).path!!)
            assertTrue(outputFile.exists())
            assertTrue(outputFile.length() > 0)
            
            // Clean up
            tempFile.delete()
            outputFile.delete()
        }
    }
}
