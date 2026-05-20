package com.grovkornet.nativefilmcamera.rendering

import android.graphics.Bitmap
import android.graphics.Color
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class OffscreenFilmProcessorTest {

    @Test
    fun testInitializationAndProcessing() = runBlocking {
        val processor = OffscreenFilmProcessor()
        
        // 1. Verify we can prepare the processor
        val width = 128
        val height = 128
        processor.prepare(width, height)
        
        // 2. Create a dummy solid input bitmap (Red color)
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.RED)
        
        // Set camera parameters
        val params = CameraConfiguration(
            saturation = 1.0f,
            contrast = 1.0f,
            ev = 0.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        
        // 3. Process the bitmap
        val outputBitmap = processor.process(inputBitmap, params)
        
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
        val width = 64
        val height = 64
        processor.prepare(width, height)
        
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.rgb(128, 128, 128)) // Mid-gray
        
        // Render 1: Identity
        val identityParams = CameraConfiguration(
            saturation = 1.0f,
            contrast = 1.0f,
            ev = 0.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        val outIdentity = processor.process(inputBitmap, identityParams)
        val pixelIdentity = outIdentity.getPixel(width / 2, height / 2)
        val rId = Color.red(pixelIdentity)
        
        // Render 2: Darken (EV = -2.0)
        val darkParams = CameraConfiguration(
            saturation = 1.0f,
            contrast = 1.0f,
            ev = -2.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        val outDark = processor.process(inputBitmap, darkParams)
        val pixelDark = outDark.getPixel(width / 2, height / 2)
        val rDark = Color.red(pixelDark)
        
        // Render 3: Saturation = 0 (Grayscale conversion)
        val grayParams = CameraConfiguration(
            saturation = 0.0f,
            contrast = 1.0f,
            ev = 0.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        val inputColor = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputColor.eraseColor(Color.RED)
        val outGray = processor.process(inputColor, grayParams)
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
        val width = 64
        val height = 64
        processor.prepare(width, height)
        
        // Create a black bitmap with a bright white block in the center (10x10 pixels)
        val inputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        inputBitmap.eraseColor(Color.BLACK)
        for (y in (height / 2 - 5)..(height / 2 + 5)) {
            for (x in (width / 2 - 5)..(width / 2 + 5)) {
                inputBitmap.setPixel(x, y, Color.WHITE)
            }
        }
        
        val params = CameraConfiguration(
            saturation = 1.0f,
            contrast = 1.0f,
            ev = 0.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        
        val outputBitmap = processor.process(inputBitmap, params)
        
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
}
