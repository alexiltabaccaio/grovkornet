package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapRegionDecoder
import android.graphics.Matrix
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
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
        if (android.os.Build.VERSION.SDK_INT >= 31) {
            every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any()) } returns mockDecoder
        }
        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any(), any()) } returns mockDecoder
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

    @Test
    fun testScaleToTargetResolution_progressiveDownscaling() {
        val startBitmap = mockk<Bitmap>(relaxed = true)
        every { startBitmap.width } returns 5000
        every { startBitmap.height } returns 5000

        val intermediateBitmap1 = mockk<Bitmap>(relaxed = true)
        val intermediateBitmap2 = mockk<Bitmap>(relaxed = true)
        val finalBitmap = mockk<Bitmap>(relaxed = true)

        every { Bitmap.createScaledBitmap(startBitmap, 2500, 2500, true) } returns intermediateBitmap1
        every { Bitmap.createScaledBitmap(intermediateBitmap1, 1250, 1250, true) } returns intermediateBitmap2
        every { Bitmap.createScaledBitmap(intermediateBitmap2, 1080, 1080, true) } returns finalBitmap

        val result = ImageProcessorPipeline.scaleToTargetResolution(startBitmap, 2)
        
        assertSame(finalBitmap, result)
        verify(exactly = 1) { intermediateBitmap1.recycle() }
        verify(exactly = 1) { intermediateBitmap2.recycle() }
        verify(exactly = 1) { startBitmap.recycle() }
    }

    @Test
    fun testScaleToTargetResolution_allResolutionSettings() {
        val settings = listOf(0, 1, 2, 3, 4, 5, 6, 7, 99)
        val expectedSizes = listOf(2160, 1440, 1080, 720, 480, 360, 240, 144, 1080)
        
        for (i in settings.indices) {
            val setting = settings[i]
            val expectedSize = expectedSizes[i]
            
            val bmp = mockk<Bitmap>(relaxed = true)
            every { bmp.width } returns (expectedSize * 2)
            every { bmp.height } returns (expectedSize * 2)
            
            val scaledBmp = mockk<Bitmap>(relaxed = true)
            every { Bitmap.createScaledBitmap(any(), expectedSize, expectedSize, any()) } returns scaledBmp
            
            val result = ImageProcessorPipeline.scaleToTargetResolution(bmp, setting)
            val expectedFilter = expectedSize > 480
            
            verify { Bitmap.createScaledBitmap(bmp, expectedSize, expectedSize, expectedFilter) }
            assertSame(scaledBmp, result)
        }
    }

    @Test
    fun testProcessRawCaptureBytes_fallbackOnDecoderException() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns false

        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any(), any()) } throws RuntimeException("Simulated decoder crash")
        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any()) } throws RuntimeException("Simulated decoder crash")

        val fallbackBitmap = mockk<Bitmap>(relaxed = true)
        every { fallbackBitmap.width } returns 4000
        every { fallbackBitmap.height } returns 3000
        
        every { BitmapFactory.decodeByteArray(any(), any(), any(), any()) } answers {
            val options = arg<BitmapFactory.Options>(3)
            if (options.inJustDecodeBounds) {
                options.outWidth = 4000
                options.outHeight = 3000
                mockOriginal
            } else {
                fallbackBitmap
            }
        }

        val croppedBitmap = mockk<Bitmap>(relaxed = true)
        every { croppedBitmap.width } returns 4000
        every { croppedBitmap.height } returns 2250
        mockkObject(ImageUtils)
        every { ImageUtils.cropToAspectRatio(fallbackBitmap, 1) } returns croppedBitmap

        val finalResultBitmap = mockk<Bitmap>(relaxed = true)
        every { Bitmap.createBitmap(croppedBitmap, 0, 0, 4000, 2250, any(), any()) } returns finalResultBitmap

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNotNull(result)
        assertSame(finalResultBitmap, result)
        verify(exactly = 1) { fallbackBitmap.recycle() }
        verify(exactly = 1) { croppedBitmap.recycle() }
        
        unmockkObject(ImageUtils)
    }

    @Test
    fun testProcessRawCaptureBytes_matrixTransformException() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns false

        every { Bitmap.createBitmap(any<Bitmap>(), any(), any(), any(), any(), any(), any()) } throws RuntimeException("Simulated createBitmap crash")

        every { mockOriginal.width } returns 4000
        every { mockOriginal.height } returns 2250

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNull(result)
        verify(exactly = 1) { mockOriginal.recycle() }
    }

    @Test
    fun testProcessRenderPipeline() = kotlinx.coroutines.runBlocking {
        val bitmap = mockk<Bitmap>()
        val config = mockk<CameraConfiguration>()
        val context = mockk<android.content.Context>()
        val processor = mockk<OffscreenFilmProcessor>()
        val expectedResult = mockk<Bitmap>()

        coEvery { processor.process(bitmap, config, context) } returns expectedResult

        val result = ImageProcessorPipeline.processRenderPipeline(bitmap, config, context, processor)

        assertSame(expectedResult, result)
        coVerify(exactly = 1) { processor.process(bitmap, config, context) }
    }

    @Test
    @Config(sdk = [28])
    fun testProcessRawCaptureBytes_legacySdk() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns false

        every { mockOriginal.width } returns 4000
        every { mockOriginal.height } returns 2250

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNotNull(result)
        assertSame(mockResult, result)
        verify(exactly = 1) { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any(), false) }
    }

    @Test
    fun testProcessRawCaptureBytes_variousResolutions() {
        val settings = listOf(0, 1, 3, 4, 5, 6, 7, 99)
        val expectedSizes = listOf(2160, 1440, 720, 480, 360, 240, 144, 1080)

        for (i in settings.indices) {
            val setting = settings[i]
            val expectedSize = expectedSizes[i]

            val config = mockk<CameraConfiguration>(relaxed = true)
            every { config.aspectRatio } returns 1 // 16:9
            every { config.resolutionSetting } returns setting
            every { config.isSelfieCamera } returns false

            every { mockOriginal.width } returns 4000
            every { mockOriginal.height } returns 2250

            val dummyBytes = ByteArray(10)
            val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 0, config)

            assertNotNull(result)
            assertSame(mockResult, result)
        }
    }

    @Test
    fun testProcessRawCaptureBytes_selfieCamera() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns true

        // Mock decoded bounds
        every { mockOriginal.width } returns 4000
        every { mockOriginal.height } returns 2250

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNotNull(result)
        assertSame(mockResult, result)
    }

    @Test
    fun testProcessRawCaptureBytes_fallbackDecodeException() {
        val config = mockk<CameraConfiguration>(relaxed = true)
        every { config.aspectRatio } returns 1 // 16:9
        every { config.resolutionSetting } returns 2 // 1080p
        every { config.isSelfieCamera } returns false

        // Throw on BitmapRegionDecoder
        every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any(), any()) } throws RuntimeException("Simulated decoder crash")
        if (android.os.Build.VERSION.SDK_INT >= 31) {
            every { BitmapRegionDecoder.newInstance(any<ByteArray>(), any(), any()) } throws RuntimeException("Simulated decoder crash")
        }

        // Throw on BitmapFactory.decodeByteArray in fallback
        every { BitmapFactory.decodeByteArray(any(), any(), any(), any()) } answers {
            val options = arg<BitmapFactory.Options>(3)
            if (options.inJustDecodeBounds) {
                options.outWidth = 4000
                options.outHeight = 3000
                mockOriginal
            } else {
                throw RuntimeException("Simulated fallback BitmapFactory crash")
            }
        }

        val dummyBytes = ByteArray(10)
        val result = ImageProcessorPipeline.processRawCaptureBytes(dummyBytes, 90, config)

        assertNull(result)
    }
}
