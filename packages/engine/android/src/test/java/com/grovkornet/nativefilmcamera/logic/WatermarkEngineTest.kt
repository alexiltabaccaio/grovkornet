package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)
class WatermarkEngineTest {

    private lateinit var context: Context
    private lateinit var contentResolver: android.content.ContentResolver
    private lateinit var tempFile: File
    
    private lateinit var originalEmbedDelegate: (Bitmap) -> Boolean
    private lateinit var originalVerifyDelegate: (Bitmap) -> Boolean

    @Before
    fun setUp() {
        context = mockk(relaxed = true)
        contentResolver = mockk(relaxed = true)
        every { context.contentResolver } returns contentResolver
        
        // Create a real temp file for tests
        tempFile = File.createTempFile("test_watermark", ".jpg")
        tempFile.writeBytes(byteArrayOf(0, 1, 2, 3)) // dummy data
        every { context.cacheDir } returns tempFile.parentFile

        mockkConstructor(android.media.ExifInterface::class)
        
        originalEmbedDelegate = WatermarkEngine.nativeEmbedDelegate
        originalVerifyDelegate = WatermarkEngine.nativeVerifyDelegate
    }

    @After
    fun tearDown() {
        WatermarkEngine.nativeEmbedDelegate = originalEmbedDelegate
        WatermarkEngine.nativeVerifyDelegate = originalVerifyDelegate
        unmockkAll()
        if (tempFile.exists()) {
            tempFile.delete()
        }
    }

    @Test
    fun testEmbedSignature_callsNativeEmbedSignature() {
        val mockBitmap = mockk<Bitmap>(relaxed = true)
        var delegateCalled = false
        WatermarkEngine.nativeEmbedDelegate = {
            delegateCalled = true
            true
        }
        
        val result = WatermarkEngine.embedSignature(mockBitmap)
        assertSame(mockBitmap, result)
        assertTrue("Should invoke the native embed delegate", delegateCalled)
    }

    @Test
    fun testVerifyGrovkornetAuthenticity_fastPath_returnsTrue() {
        val uri = Uri.fromFile(tempFile)
        every { contentResolver.openInputStream(uri) } answers { tempFile.inputStream() }

        // Stub EXIF to return Software starting with Grovkornet
        every { anyConstructed<android.media.ExifInterface>().getAttribute(android.media.ExifInterface.TAG_SOFTWARE) } returns "Grovkornet v1.0"

        val result = WatermarkEngine.verifyGrovkornetAuthenticity(context, uri)
        assertTrue("Fast path should return true when EXIF software tag matches", result)
    }

    @Test
    fun testVerifyGrovkornetAuthenticity_fallbackPath_callsNativeVerifySignature_andReturnsTrue() {
        val uri = Uri.fromFile(tempFile)
        every { contentResolver.openInputStream(uri) } answers { tempFile.inputStream() }

        // Stub EXIF to return non-matching software
        every { anyConstructed<android.media.ExifInterface>().getAttribute(android.media.ExifInterface.TAG_SOFTWARE) } returns "Canon EOS"

        // Mock BitmapFactory to return a mock bitmap
        mockkStatic(BitmapFactory::class)
        val mockBitmap = mockk<Bitmap>(relaxed = true)
        every { BitmapFactory.decodeFile(any(), any()) } returns mockBitmap

        var delegateCalled = false
        WatermarkEngine.nativeVerifyDelegate = {
            delegateCalled = true
            true
        }

        val result = WatermarkEngine.verifyGrovkornetAuthenticity(context, uri)
        assertTrue("Fallback path should return true when nativeVerifySignature returns true", result)
        assertTrue("Should invoke native verify delegate", delegateCalled)

        verify { mockBitmap.recycle() }
    }

    @Test
    fun testVerifyGrovkornetAuthenticity_fallbackPath_returnsFalse_whenNativeVerifySignatureReturnsFalse() {
        val uri = Uri.fromFile(tempFile)
        every { contentResolver.openInputStream(uri) } answers { tempFile.inputStream() }

        every { anyConstructed<android.media.ExifInterface>().getAttribute(android.media.ExifInterface.TAG_SOFTWARE) } returns null

        mockkStatic(BitmapFactory::class)
        val mockBitmap = mockk<Bitmap>(relaxed = true)
        every { BitmapFactory.decodeFile(any(), any()) } returns mockBitmap

        WatermarkEngine.nativeVerifyDelegate = { false }

        val result = WatermarkEngine.verifyGrovkornetAuthenticity(context, uri)
        assertFalse("Fallback path should return false when nativeVerifySignature returns false", result)
    }
}
