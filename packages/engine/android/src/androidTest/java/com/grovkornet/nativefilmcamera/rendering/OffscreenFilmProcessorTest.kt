package com.grovkornet.nativefilmcamera.rendering

import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.Color
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import io.mockk.mockk
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class OffscreenFilmProcessorTest {

    @Test
    fun testInitializationAndProcessing() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        
        // 1. Verify we can prepare the processor
        val width = 128
        val height = 128
        processor.prepare(width, height, context.assets)
        
        // 2. Create a dummy solid input bitmap (Red color)
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.RED)
        
        // Set camera parameters
        val params = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
        }
        
        // 3. Process the bitmap
        val outputBitmap = processor.process(inputBitmap, params, context)
        
        // 4. Verification
        assertNotNull("Output bitmap should not be null", outputBitmap)
        assertEquals("Output bitmap width should match input", width, outputBitmap.width)
        assertEquals("Output bitmap height should match input", height, outputBitmap.height)
        
        // Verify that we processed and got a pixel value back
        val centerPixel = outputBitmap.getPixel(width / 2, height / 2)
        
        // Red color under normal identity rendering should yield a reddish color
        val r = Color.red(centerPixel)
        val g = Color.green(centerPixel)
        val b = Color.blue(centerPixel)
        
        assertTrue("Output should contain some color info", r > 0 || g > 0 || b > 0)
        
        // 5. Release
        processor.release()
    }

    @Test
    fun testVaryingParameters() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        processor.prepare(width, height, context.assets)
        
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.rgb(128, 128, 128)) // Mid-gray
        
        // Render 1: Identity
        val identityParams = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
        }
        val outIdentity = processor.process(inputBitmap, identityParams, context)
        val pixelIdentity = outIdentity.getPixel(width / 2, height / 2)
        val rId = Color.red(pixelIdentity)
        
        // Render 2: Darken (EV = -2.0)
        val darkParams = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = -2.0f
            whiteBalance = 5000.0f
            tint = 0.0f
        }
        val outDark = processor.process(inputBitmap, darkParams, context)
        val pixelDark = outDark.getPixel(width / 2, height / 2)
        val rDark = Color.red(pixelDark)
        
        // Render 3: Saturation = 0 (Grayscale conversion)
        val grayParams = CameraConfiguration().apply {
            saturation = 0.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
        }
        val inputColor = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputColor.eraseColor(Color.RED)
        val outGray = processor.process(inputColor, grayParams, context)
        val pixelGray = outGray.getPixel(width / 2, height / 2)
        val gGray = Color.green(pixelGray)
        
        // Assertions
        assertTrue("Darkened exposure should result in a lower value ($rDark < $rId)", rDark < rId)
        assertTrue("Grayscale red input should have green channel > 0 ($gGray > 0)", gGray > 0)
        
        processor.release()
    }

    @Test
    fun testBloomEffect() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        processor.prepare(width, height, context.assets)
        
        // Create a black bitmap with a bright white block in the center (10x10 pixels)
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.BLACK)
        for (y in (height / 2 - 5)..(height / 2 + 5)) {
            for (x in (width / 2 - 5)..(width / 2 + 5)) {
                inputBitmap.setPixel(x, y, Color.WHITE)
            }
        }
        
        val params = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
            bloomEnabled = true
            bloomIntensity = 1.0f
        }
        
        val outputBitmap = processor.process(inputBitmap, params, context)
        
        // Verify that the light has bled/bloomed into the surrounding pixels
        // (which were initially pure black)
        val bleedPixel = outputBitmap.getPixel(width / 2 - 8, height / 2 - 8)
        val rBleed = Color.red(bleedPixel)
        val gBleed = Color.green(bleedPixel)
        val bBleed = Color.blue(bleedPixel)
        
        assertTrue("Bloom should bleed light into nearby black pixels: R=$rBleed, G=$gBleed, B=$bBleed",
            rBleed > 0 || gBleed > 0 || bBleed > 0)
            
        processor.release()
    }

    @Test
    fun testProceduralEffects() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        processor.prepare(width, height, context.assets)
        
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.BLUE) // solid blue input
        
        // 1. Identity Render
        val identityParams = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
            grainEnabled = false
            vignetteIntensity = 0.0f
            chromaShift = 0.0f
        }
        val outIdentity = processor.process(inputBitmap, identityParams, context)
        val cornerIdentity = outIdentity.getPixel(2, 2)
        
        // 2. Render with vignette (center should be normal, but corners should be darker)
        val vignetteParams = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
            grainEnabled = false
            vignetteIntensity = 1.0f
            chromaShift = 0.0f
        }
        val outVignette = processor.process(inputBitmap, vignetteParams, context)
        val cornerVignette = outVignette.getPixel(2, 2)
        
        assertTrue("Vignette should darken the corners of the image: B_vignette (${Color.blue(cornerVignette)}) < B_identity (${Color.blue(cornerIdentity)})",
            Color.blue(cornerVignette) < Color.blue(cornerIdentity))
            
        // 3. Render with high grain intensity
        val grainParams = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
            grainEnabled = true
            grainIntensity = 0.5f
            grainChroma = 0.5f
            grainSize = 1.0f
            vignetteIntensity = 0.0f
            chromaShift = 0.0f
        }
        val outGrain = processor.process(inputBitmap, grainParams, context)
        
        // Grain is random noise, so nearby pixels in solid area should not be identical anymore
        val pixel1 = outGrain.getPixel(width / 2, height / 2)
        val pixel2 = outGrain.getPixel(width / 2 + 1, height / 2)
        assertNotEquals("Grain should introduce pixel noise variance", pixel1, pixel2)
        
        processor.release()
    }

    @Test
    fun testOverlayBlending() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        processor.prepare(width, height, context.assets)
        
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.BLACK)
        
        // Create an overlay bitmap with a solid red dot in the center (transparent elsewhere)
        val overlayBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        overlayBitmap.eraseColor(Color.TRANSPARENT)
        for (y in 20..30) {
            for (x in 20..30) {
                overlayBitmap.setPixel(x, y, Color.RED)
            }
        }
        
        // Pass to native overlay
        processor.updateOverlay(arrayOf(overlayBitmap))
        
        // Give background thread a tiny moment to process the overlay blend before we render
        delay(100)
        
        // Render
        val params = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f,
            grainEnabled = false
            vignetteIntensity = 0.0f
            chromaShift = 0.0f
        }
        
        val output = processor.process(inputBitmap, params, context)
        
        // Center-ish pixel (25, 25) should now be red
        // Since the pipeline output is vertically flipped, y=25 maps to y=height-1-25
        val pixelOver = output.getPixel(25, height - 1 - 25)
        val r = Color.red(pixelOver)
        val g = Color.green(pixelOver)
        val b = Color.blue(pixelOver)
        
        assertTrue("Overlay should blend red color onto the black input image: R=$r, G=$g, B=$b", r > 100 && g < 50 && b < 50)
        
        processor.release()
    }

    @Test
    fun testDynamicResolutionScaling() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        processor.prepare(width, height, context.assets)
        
        // Initial DRS scale should be 1.0
        assertEquals("Initial DRS scale should be 1.0f", 1.0f, processor.getDrsScale(), 0.001f)
        
        // Simulate high frame times (e.g. 20ms) to trigger resolution scale down.
        // We need to send at least 10 frames to fill the moving window.
        for (i in 1..10) {
            processor.simulateFrameTime(20.0f)
        }
        
        val scaleAfterHighLoad = processor.getDrsScale()
        assertTrue("DRS scale should have decreased under high load (current: $scaleAfterHighLoad)", scaleAfterHighLoad < 1.0f)
        
        // Simulate low frame times (e.g. 5ms) to trigger resolution scale up.
        // We need to send low frame times. We need to do it at least 35 times (exceeding 30 frame cooldown).
        for (i in 1..35) {
            processor.simulateFrameTime(5.0f)
        }
        
        val scaleAfterRecovery = processor.getDrsScale()
        assertTrue("DRS scale should have recovered/increased under low load (current: $scaleAfterRecovery)", scaleAfterRecovery > scaleAfterHighLoad)
        
        processor.release()
    }

    @Test
    fun testHardwareBufferProcessing() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        
        // 1. Prepare
        processor.prepare(width, height, context.assets)
        
        // 2. Create HardwareBuffer
        val usage = android.hardware.HardwareBuffer.USAGE_GPU_SAMPLED_IMAGE or android.hardware.HardwareBuffer.USAGE_GPU_COLOR_OUTPUT
        val hardwareBuffer = android.hardware.HardwareBuffer.create(
            width, height,
            android.hardware.HardwareBuffer.RGBA_8888,
            1,
            usage
        )
        
        val params = CameraConfiguration().apply {
            saturation = 1.0f
            contrast = 1.0f
            ev = 0.0f
            whiteBalance = 5000.0f
            tint = 0.0f
        }
        
        // 3. Process
        processor.processHardwareBuffer(hardwareBuffer, params, context)
        
        // 4. Test resolution change in processHardwareBuffer
        val diffWidth = 128
        val diffHeight = 128
        val diffHardwareBuffer = android.hardware.HardwareBuffer.create(
            diffWidth, diffHeight,
            android.hardware.HardwareBuffer.RGBA_8888,
            1,
            usage
        )
        // This should auto-prepare for the new size
        processor.processHardwareBuffer(diffHardwareBuffer, params, context)
        
        // 5. Test exception case (closed HardwareBuffer)
        val closedBuffer = android.hardware.HardwareBuffer.create(
            width, height,
            android.hardware.HardwareBuffer.RGBA_8888,
            1,
            usage
        )
        closedBuffer.close()
        try {
            processor.processHardwareBuffer(closedBuffer, params, context)
            fail("Expected exception when processing a closed HardwareBuffer")
        } catch (e: Exception) {
            // Expected
        }
        
        // Clean up
        hardwareBuffer.close()
        diffHardwareBuffer.close()
        processor.release()
    }

    @Test
    fun testDuplicatePrepare() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        
        processor.prepare(width, height, context.assets)
        // Second prepare with same size should return early
        processor.prepare(width, height, context.assets)
        
        // Prepare with different size should release and re-prepare
        processor.prepare(width * 2, height * 2, context.assets)
        
        processor.release()
    }

    @Test
    fun testResolutionChangeAutoPrepare() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val width = 64
        val height = 64
        
        val params = CameraConfiguration()
        val input1 = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        
        // Calling process without prepare should auto-prepare
        val output1 = processor.process(input1, params, context)
        assertNotNull(output1)
        
        // Calling process with different dimensions should auto-prepare
        val input2 = Bitmap.createBitmap(width * 2, height * 2, Bitmap.Config.ARGB_8888)
        val output2 = processor.process(input2, params, context)
        assertNotNull(output2)
        
        input1.recycle()
        input2.recycle()
        output1.recycle()
        output2.recycle()
        processor.release()
    }

    @Test
    fun testOffscreenPrepareException() = runBlocking {
        val processor = OffscreenFilmProcessor()
        val mockAssets = mockk<AssetManager>(relaxed = true)
        try {
            processor.prepare(128, 128, mockAssets)
            fail("Expected FilamentInitFailed exception due to mocked AssetManager")
        } catch (e: Exception) {
            // Expected to catch CameraCodedException
        }
    }
}
