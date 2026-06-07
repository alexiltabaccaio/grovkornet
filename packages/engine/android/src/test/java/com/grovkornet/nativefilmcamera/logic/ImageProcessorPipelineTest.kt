package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import android.graphics.Matrix
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class ImageProcessorPipelineTest {

    private lateinit var mockOriginal: Bitmap
    private lateinit var mockResult: Bitmap

    @Before
    fun setUp() {
        mockOriginal = mockk<Bitmap>(relaxed = true)
        mockResult = mockk<Bitmap>(relaxed = true)

        mockkStatic(Bitmap::class)
        mockkConstructor(Matrix::class)

        every { mockOriginal.width } returns 100
        every { mockOriginal.height } returns 200

        every { Bitmap.createBitmap(any<Bitmap>(), any(), any(), any(), any(), any(), any()) } returns mockResult
        every { Bitmap.createScaledBitmap(any(), any(), any(), any()) } returns mockResult
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
}
