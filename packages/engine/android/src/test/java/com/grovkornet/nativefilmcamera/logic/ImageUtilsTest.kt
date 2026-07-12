package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)
class ImageUtilsTest {

    @Test
    fun cropToAspectRatio_invalidType_returnsOriginal() {
        val original = Bitmap.createBitmap(800, 600, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 999) // Invalid type
        assertSame("Should return the original bitmap instance if aspect ratio type is invalid", original, result)
    }

    @Test
    fun cropToAspectRatio_closeTolerance_doesNotCrop() {
        // 4:3 aspect ratio = 1.3333...
        // 800x600 is exactly 4:3, so difference should be 0.
        val original = Bitmap.createBitmap(800, 600, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 0) // type 0 = 4:3
        assertSame("Should return original instance if current aspect ratio matches target within 0.01 tolerance", original, result)
    }

    @Test
    fun cropToAspectRatio_landscape_cropsWiderTo4_3() {
        // 16:9 landscape image (1920x1080) cropped to 4:3 (type 0)
        // targetAspect = 4f / 3f = 1.3333
        // currentAspect = 1.7777 (which is > targetAspect)
        // targetWidth = (1080 * 1.3333).toInt() = 1440
        // targetHeight = 1080
        // x = (1920 - 1440) / 2 = 240
        val original = Bitmap.createBitmap(1920, 1080, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 0) // 4:3
        
        assertNotSame(original, result)
        assertEquals(1440, result.width)
        assertEquals(1080, result.height)
    }

    @Test
    fun cropToAspectRatio_landscape_cropsTallerTo16_9() {
        // 4:3 landscape image (1600x1200) cropped to 16:9 (type 1)
        // targetAspect = 16f / 9f = 1.7777
        // currentAspect = 1.3333 (which is < targetAspect)
        // targetWidth = 1600
        // targetHeight = (1600 / 1.7777).toInt() = 900
        // y = (1200 - 900) / 2 = 150
        val original = Bitmap.createBitmap(1600, 1200, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 1) // 16:9
        
        assertNotSame(original, result)
        assertEquals(1600, result.width)
        assertEquals(900, result.height)
    }

    @Test
    fun cropToAspectRatio_portrait_cropsWiderToPortrait4_3() {
        // 9:16 portrait image (1080x1920) cropped to 4:3 (type 0)
        // Because height > width, targetAspect gets inverted: targetAspect = 1f / (4f / 3f) = 3f / 4f = 0.75
        // currentAspect = 1080 / 1920 = 0.5625
        // currentAspect < targetAspect, so it's taller/thinner, so we crop height.
        // targetWidth = 1080
        // targetHeight = (1080 / 0.75).toInt() = 1440
        // y = (1920 - 1440) / 2 = 240
        val original = Bitmap.createBitmap(1080, 1920, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 0) // 4:3 (maps to 3:4 in portrait)

        assertNotSame(original, result)
        assertEquals(1080, result.width)
        assertEquals(1440, result.height)
    }

    @Test
    fun cropToAspectRatio_square_cropsCorrectly() {
        // landscape image (1200x800) cropped to square (type 2, 1:1)
        val original = Bitmap.createBitmap(1200, 800, Bitmap.Config.ARGB_8888)
        val result = ImageUtils.cropToAspectRatio(original, 2) // 1:1

        assertNotSame(original, result)
        assertEquals(800, result.width)
        assertEquals(800, result.height)
    }

    @Test
    fun calculateCropRectBeforeRotation_invalidType_returnsFullBounds() {
        val rect = ImageUtils.calculateCropRectBeforeRotation(800, 600, 0, 999)
        assertEquals(0, rect.left)
        assertEquals(0, rect.top)
        assertEquals(800, rect.right)
        assertEquals(600, rect.bottom)
    }

    @Test
    fun calculateCropRectBeforeRotation_closeTolerance_returnsFullBounds() {
        val rect = ImageUtils.calculateCropRectBeforeRotation(800, 600, 0, 0) // 4:3 (type 0)
        assertEquals(0, rect.left)
        assertEquals(0, rect.top)
        assertEquals(800, rect.right)
        assertEquals(600, rect.bottom)
    }

    @Test
    fun calculateCropRectBeforeRotation_landscape_rotation90_target16_9() {
        // Raw: 4000x3000 (4:3), Rotated 90: 3000x4000 (portrait).
        // Target: 16:9, which maps to 9:16 portrait -> 2250x4000 rotated.
        // Unrotated crop should be 4000x2250 (16:9).
        val rect = ImageUtils.calculateCropRectBeforeRotation(4000, 3000, 90, 1) // 16:9 (type 1)
        assertEquals(0, rect.left)
        assertEquals(375, rect.top)
        assertEquals(4000, rect.right)
        assertEquals(2625, rect.bottom)
    }

    @Test
    fun calculateCropRectBeforeRotation_landscape_rotation0_target16_9() {
        // Raw: 4000x3000 (4:3), Rotated 0: 4000x3000.
        // Target: 16:9 landscape -> 4000x2250.
        val rect = ImageUtils.calculateCropRectBeforeRotation(4000, 3000, 0, 1) // 16:9
        assertEquals(0, rect.left)
        assertEquals(375, rect.top)
        assertEquals(4000, rect.right)
        assertEquals(2625, rect.bottom)
    }

    @Test
    fun calculateCropRectBeforeRotation_portraitSensor_rotation90_target16_9() {
        // Raw: 3000x4000 (portrait), Rotated 90: 4000x3000 (landscape).
        // Target: 16:9 landscape -> 4000x2250.
        // Unrotated crop should be 2250x4000 (portrait 9:16).
        val rect = ImageUtils.calculateCropRectBeforeRotation(3000, 4000, 90, 1) // 16:9
        assertEquals(375, rect.left)
        assertEquals(0, rect.top)
        assertEquals(2625, rect.right)
        assertEquals(4000, rect.bottom)
    }
}
