package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import kotlin.math.abs

object ImageUtils {
    fun cropToAspectRatio(bitmap: Bitmap, aspectRatioType: Int): Bitmap {
        var targetAspect = when (aspectRatioType) {
            0 -> 4f / 3f
            1 -> 16f / 9f
            2 -> 1f / 1f
            3 -> 3f / 2f
            4 -> 65f / 24f
            else -> return bitmap
        }

        // Adjust target aspect ratio if the image is in portrait mode
        if (bitmap.height > bitmap.width) {
            targetAspect = 1f / targetAspect
        }

        val currentAspect = bitmap.width.toFloat() / bitmap.height.toFloat()
        
        // If they are already close enough, don't crop
        if (abs(currentAspect - targetAspect) < 0.01) return bitmap

        var targetWidth = bitmap.width
        var targetHeight = bitmap.height
        var x = 0
        var y = 0

        if (currentAspect > targetAspect) {
            // Current bitmap is wider than target format (e.g. 16:9 -> 4:3)
            targetWidth = (bitmap.height * targetAspect).toInt()
            x = (bitmap.width - targetWidth) / 2
        } else {
            // Current bitmap is taller than target format (e.g. 4:3 -> 16:9)
            targetHeight = (bitmap.width / targetAspect).toInt()
            y = (bitmap.height - targetHeight) / 2
        }

        // Safety check
        if (targetWidth <= 0 || targetHeight <= 0) return bitmap
        if (x + targetWidth > bitmap.width) targetWidth = bitmap.width - x
        if (y + targetHeight > bitmap.height) targetHeight = bitmap.height - y

        return Bitmap.createBitmap(bitmap, x, y, targetWidth, targetHeight)
    }
}
