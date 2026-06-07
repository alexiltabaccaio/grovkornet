package com.grovkornet.nativefilmcamera.capture

import android.content.Context
import android.graphics.Bitmap
import android.view.PixelCopy
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import io.mockk.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class ThumbnailCaptureServiceTest {

    private lateinit var context: Context
    private lateinit var mockView: SurfaceView
    private lateinit var mockHolder: SurfaceHolder
    private lateinit var mockSurface: Surface

    @Before
    fun setUp() {
        context = mockk<Context>(relaxed = true)
        mockView = mockk<SurfaceView>()
        mockHolder = mockk<SurfaceHolder>()
        mockSurface = mockk<Surface>()

        val tempDir = java.io.File(System.getProperty("java.io.tmpdir")!!)
        every { context.cacheDir } returns tempDir

        every { mockView.context } returns context
        every { mockView.holder } returns mockHolder
        every { mockHolder.surface } returns mockSurface
        every { mockSurface.isValid } returns true

        mockkStatic(Bitmap::class)
        val mockBitmap = mockk<Bitmap>(relaxed = true)
        every { Bitmap.createBitmap(any<Int>(), any<Int>(), any()) } returns mockBitmap
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testCaptureThumbnail_handlesFailureResult() {
        var capturedUri: String? = null

        // Simulate a PixelCopy.request failure
        ThumbnailCaptureService.captureThumbnail(
            view = mockView,
            surfaceWidth = 100,
            surfaceHeight = 100,
            onThumbnailCaptured = { uri ->
                capturedUri = uri
            },
            pixelCopyAction = { _, _, listener, handler ->
                handler.post {
                    listener.onPixelCopyFinished(PixelCopy.ERROR_UNKNOWN)
                }
            }
        )

        // Execute any posted tasks on the main looper
        org.robolectric.shadows.ShadowLooper.idleMainLooper()
        assertNull("Should not capture thumbnail in case of error", capturedUri)
    }

    @Test
    fun testCaptureThumbnail_handlesSuccessResult() {
        var capturedUri: String? = null

        // Simulate a PixelCopy.request success
        ThumbnailCaptureService.captureThumbnail(
            view = mockView,
            surfaceWidth = 100,
            surfaceHeight = 100,
            onThumbnailCaptured = { uri ->
                capturedUri = uri
            },
            pixelCopyAction = { _, _, listener, handler ->
                handler.post {
                    listener.onPixelCopyFinished(PixelCopy.SUCCESS)
                }
            }
        )

        // Run the main looper and wait for background Dispatchers.IO coroutine to finish
        var attempts = 0
        while (capturedUri == null && attempts < 100) {
            org.robolectric.shadows.ShadowLooper.idleMainLooper()
            Thread.sleep(50)
            attempts++
        }

        assertNotNull("Should capture thumbnail in case of success", capturedUri)
        assertTrue("Captured URI must start with file://", capturedUri!!.startsWith("file://"))

        // Cleanup
        try {
            val file = java.io.File(capturedUri!!.removePrefix("file://"))
            if (file.exists()) file.delete()
        } catch (e: Exception) {}
    }
}
