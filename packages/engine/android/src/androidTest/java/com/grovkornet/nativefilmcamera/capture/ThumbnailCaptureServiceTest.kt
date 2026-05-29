package com.grovkornet.nativefilmcamera.capture

import android.graphics.Bitmap
import android.view.PixelCopy
import android.view.SurfaceView
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class)
class ThumbnailCaptureServiceTest {

    @Test
    fun testCaptureThumbnail_handlesFailureResult() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val view = SurfaceView(context)
        val latch = CountDownLatch(1)
        var capturedUri: String? = null

        // Simulate a PixelCopy.request failure
        ThumbnailCaptureService.captureThumbnail(
            view = view,
            surfaceWidth = 100,
            surfaceHeight = 100,
            onThumbnailCaptured = { uri ->
                capturedUri = uri
                latch.countDown()
            },
            pixelCopyAction = { _, _, listener, handler ->
                handler.post {
                    listener.onPixelCopyFinished(PixelCopy.ERROR_UNKNOWN)
                    latch.countDown()
                }
            }
        )

        latch.await(2, TimeUnit.SECONDS)
        assertNull("Should not capture thumbnail in case of error", capturedUri)
    }

    @Test
    fun testCaptureThumbnail_handlesSuccessResult() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val view = SurfaceView(context)
        val latch = CountDownLatch(1)
        var capturedUri: String? = null

        // Simulate a PixelCopy.request success
        ThumbnailCaptureService.captureThumbnail(
            view = view,
            surfaceWidth = 100,
            surfaceHeight = 100,
            onThumbnailCaptured = { uri ->
                capturedUri = uri
                latch.countDown()
            },
            pixelCopyAction = { _, _, listener, handler ->
                handler.post {
                    listener.onPixelCopyFinished(PixelCopy.SUCCESS)
                }
            }
        )

        latch.await(5, TimeUnit.SECONDS)
        assertNotNull("Should capture thumbnail in case of success", capturedUri)
        assertTrue("Captured URI must start with file://", capturedUri!!.startsWith("file://"))
        
        // Cleanup
        try {
            val file = java.io.File(android.net.Uri.parse(capturedUri).path!!)
            if (file.exists()) file.delete()
        } catch (e: Exception) {}
    }
}
