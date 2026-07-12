package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapRegionDecoder
import android.graphics.Matrix
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ImageProcessorPipelineTest {

    private lateinit var mockOriginal: Bitmap
    private lateinit var mockResult: Bitmap
    private lateinit var mockDecoder: BitmapRegionDecoder

    @Before
    fun setUp() {
        mockOriginal = mockk<Bitmap>(relaxed = true)
        mockResult = mockk<Bitmap>(relaxed = true)
        mockDecoder = mockk<BitmapRegionDecoder>(relaxed = true)

        mockkStatic(Bitmap::class)
        mockkStatic(BitmapFactory::class)
        mockkStatic(BitmapRegionDecoder::class)
        mockkConstructor(Matrix::class)

        every { mockOriginal.width } returns 100
        every { mockOriginal.height } returns 200

        every { Bitmap.createBitmap(any<Bitmap>(), any(), any(), any(), any(), any(), any()) } returns mockResult
        every { Bitmap.createScaledBitmap(any(), any(), any(), any()) } returns mockResult

        // Setup BitmapFactory mock
        every { BitmapFactory.decodeByteArray(any(), any(), any(), any()) } answers {
            val options = arg<BitmapFactory.Options>(3)
            options.outWidth = 4000
            options.outHeight = 3000
            mockOriginal
        }

        // Setup BitmapRegionDecoder mock
        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any(), any()) } returns mockDecoder
        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any()) } returns mockDecoder
        every { mockDecoder.decodeRegion(any(), any()) } returns mockOriginal
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testRotateAndMirror_noOp() {
        val result = ImageProcessorPipeline.rotateAndMirror(mockOriginal, 0, false)
        assertSame("Should return the original bitmap when no rotation/mirror is needed", mockOriginal, result)
        verify(exactly = 0) { mockOriginal.recycle() }
    }

    @Test
    fun testRotateAndMirror_withRotation() {
        val result = ImageProcessorPipeline.rotateAndMirror(mockOriginal, 90, false)
        assertSame("Should return the created result bitmap", mockResult, result)
        verify(exactly = 1) { mockOriginal.recycle() }
    }

    @Test
    fun testRotateAndMirror_selfieMirroring() {
        val result = ImageProcessorPipeline.rotateAndMirror(mockOriginal, 0, true)
        assertSame("Should return the mirrored result bitmap", mockResult, result)
        verify(exactly = 1) { mockOriginal.recycle() }
    }

    @Test
    fun testScaleToTargetResolution_noScaleUp() {
        // Mock image as 100x100
        every { mockOriginal.width } returns 100
        every { mockOriginal.height } returns 100

        val result = ImageProcessorPipeline.scaleToTargetResolution(mockOriginal, 2) // Target 1080p
        assertSame("Should return original if it is smaller than target resolution", mockOriginal, result)
        verify(exactly = 0) { mockOriginal.recycle() }
    }

    @Test
    fun testScaleToTargetResolution_scaleDown() {
        // Mock image as 2000x3000 (min dimension 2000)
        every { mockOriginal.width } returns 2000
        every { mockOriginal.height } returns 3000

        val result = ImageProcessorPipeline.scaleToTargetResolution(mockOriginal, 2) // Target 1080p
        assertSame("Should return scaled bitmap", mockResult, result)
        verify(exactly = 1) { mockOriginal.recycle() }
    }

    @Test
    fun testProcessRawCaptureBytes_success() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns false

        // Mock decoded bounds
        every { mockOriginal.width } returns 4000
        every { mockOriginal.height } returns 2250 // already cropped aspect ratio size

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNotNull(result)
        assertSame(mockResult, result)
        verify(exactly = 1) { mockDecoder.decodeRegion(any(), any()) }
        verify(exactly = 1) { mockDecoder.recycle() }
        verify(exactly = 1) { mockOriginal.recycle() }
    }
}
