package com.grovkornet.nativefilmcamera.capture

import android.content.ContentResolver
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageProxy
import com.grovkornet.nativefilmcamera.logic.ExifMetadataManager
import com.grovkornet.nativefilmcamera.logic.ImageProcessorPipeline
import com.grovkornet.nativefilmcamera.logic.ImageUtils
import com.grovkornet.nativefilmcamera.logic.WatermarkEngine
import com.grovkornet.nativefilmcamera.managers.GalleryManager
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(manifest = Config.NONE)
class CapturePipelineTest {

    private lateinit var mockContext: Context
    private lateinit var mockContentResolver: ContentResolver
    private lateinit var mockGalleryManager: GalleryManager
    private lateinit var mockImageCapture: ImageCapture
    private lateinit var mockImageProxy: ImageProxy
    private lateinit var mockPlane: ImageProxy.PlaneProxy
    
    private lateinit var mockRawBitmap: Bitmap
    private lateinit var mockRotatedBitmap: Bitmap
    private lateinit var mockCroppedBitmap: Bitmap
    private lateinit var mockScaledBitmap: Bitmap
    private lateinit var mockProcessedBitmap: Bitmap
    private lateinit var mockWatermarkedBitmap: Bitmap

    private val testUri = Uri.parse("content://media/external/images/media/42")

    @Before
    fun setUp() {
        mockContext = mockk<Context>(relaxed = true)
        mockContentResolver = mockk<ContentResolver>()
        mockGalleryManager = mockk<GalleryManager>()
        mockImageCapture = mockk<ImageCapture>()
        mockImageProxy = mockk<ImageProxy>(relaxed = true)
        mockPlane = mockk<ImageProxy.PlaneProxy>()

        mockRawBitmap = mockk<Bitmap>(relaxed = true)
        mockRotatedBitmap = mockk<Bitmap>(relaxed = true)
        mockCroppedBitmap = mockk<Bitmap>(relaxed = true)
        mockScaledBitmap = mockk<Bitmap>(relaxed = true)
        mockProcessedBitmap = mockk<Bitmap>(relaxed = true)
        mockWatermarkedBitmap = mockk<Bitmap>(relaxed = true)

        // Mock context and content resolver
        every { mockContext.contentResolver } returns mockContentResolver
        val outputStream = ByteArrayOutputStream()
        every { mockContentResolver.openOutputStream(any()) } returns outputStream

        // Mock image proxy planes and buffer
        val mockBuffer = ByteBuffer.wrap(byteArrayOf(0, 1, 2, 3))
        every { mockPlane.buffer } returns mockBuffer
        every { mockImageProxy.planes } returns arrayOf(mockPlane)
        every { mockImageProxy.imageInfo.rotationDegrees } returns 90

        // Mock GalleryManager
        every { mockGalleryManager.createGalleryUri() } returns testUri

        // Mock Static Classes and Objects
        mockkStatic(BitmapFactory::class)
        mockkObject(ExifMetadataManager)
        mockkObject(ImageProcessorPipeline)
        mockkObject(ImageUtils)
        mockkObject(WatermarkEngine)

        every { BitmapFactory.decodeByteArray(any(), any(), any()) } returns mockRawBitmap
        every { ExifMetadataManager.extractMetadata(any()) } returns mapOf("Make" to "Grovkornet")
        every { ExifMetadataManager.writeMetadata(any(), any(), any()) } just Runs
        
        every { ImageProcessorPipeline.rotateAndMirror(any(), any(), any()) } returns mockRotatedBitmap
        every { ImageProcessorPipeline.scaleToTargetResolution(any(), any()) } returns mockScaledBitmap
        coEvery { ImageProcessorPipeline.processRenderPipeline(any(), any(), any(), any()) } returns mockProcessedBitmap
        
        every { ImageUtils.cropToAspectRatio(any(), any()) } returns mockCroppedBitmap
        every { WatermarkEngine.embedSignature(any()) } returns mockWatermarkedBitmap
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testTakePicture_coordinatesEntireCaptureAndSaveFlow() {
        val latch = CountDownLatch(1)
        var capturedUriString: String? = null

        val listener = object : CapturePipeline.Listener {
            override fun onPhotoCaptured(uri: String) {
                capturedUriString = uri
                latch.countDown()
            }
        }

        // Mock imageCapture.takePicture to execute the callback immediately with our mockImageProxy
        every { mockImageCapture.takePicture(any(), any<ImageCapture.OnImageCapturedCallback>()) } answers {
            val callback = secondArg<ImageCapture.OnImageCapturedCallback>()
            callback.onCaptureSuccess(mockImageProxy)
        }

        val config = CameraConfiguration().apply {
            aspectRatio = 1
            resolutionSetting = 2
            isSelfieCamera = false
        }

        val pipeline = CapturePipeline(mockContext, config, mockGalleryManager, listener)
        pipeline.takePicture(mockImageCapture)

        // Wait for asynchronous processing to complete
        var attempts = 0
        while (capturedUriString == null && attempts < 100) {
            org.robolectric.shadows.ShadowLooper.idleMainLooper()
            Thread.sleep(50)
            attempts++
        }

        assertNotNull("Async processing should complete successfully within timeout", capturedUriString)
        assertEquals(testUri.toString(), capturedUriString)

        // Verify key functions were executed in the expected sequence
        verify { BitmapFactory.decodeByteArray(any(), any(), any()) }
        verify { ImageProcessorPipeline.rotateAndMirror(mockRawBitmap, 90, false) }
        verify { ImageUtils.cropToAspectRatio(mockRotatedBitmap, 1) }
        verify { ImageProcessorPipeline.scaleToTargetResolution(mockCroppedBitmap, 2) }
        coVerify { ImageProcessorPipeline.processRenderPipeline(mockScaledBitmap, config, mockContext, any()) }
        verify { WatermarkEngine.embedSignature(mockProcessedBitmap) }
        verify { mockGalleryManager.createGalleryUri() }
        verify { mockContentResolver.openOutputStream(testUri) }
        verify { ExifMetadataManager.writeMetadata(mockContext, testUri, any()) }
        
        // Ensure the image proxy was closed
        verify { mockImageProxy.close() }
    }

    @Test
    fun testProcessAndSave_clearsBitmapsOnException() {
        // Setup config
        val config = CameraConfiguration().apply {
            aspectRatio = 1
            resolutionSetting = 2
            isSelfieCamera = false
        }

        // Trigger an exception midway through the pipeline to halt processing
        every { ImageProcessorPipeline.scaleToTargetResolution(any(), any()) } throws RuntimeException("Simulated exception for memory leak test")

        // Mock imageCapture to invoke success immediately
        every { mockImageCapture.takePicture(any(), any<ImageCapture.OnImageCapturedCallback>()) } answers {
            val callback = secondArg<ImageCapture.OnImageCapturedCallback>()
            callback.onCaptureSuccess(mockImageProxy)
        }

        val pipeline = CapturePipeline(mockContext, config, mockGalleryManager, object : CapturePipeline.Listener {
            override fun onPhotoCaptured(uri: String) {}
        })

        pipeline.takePicture(mockImageCapture)

        // Wait for coroutine processing
        var attempts = 0
        while (attempts < 50) {
            org.robolectric.shadows.ShadowLooper.idleMainLooper()
            Thread.sleep(50)
            attempts++
        }

        // The pipeline crashes during scaleToTargetResolution.
        // At that point, 'bitmap' is pointing to mockCroppedBitmap.
        // We verify that recycle is called on it to ensure memory leak prevention via finally block.
        verify(atLeast = 1) { mockCroppedBitmap.recycle() }
    }
}
