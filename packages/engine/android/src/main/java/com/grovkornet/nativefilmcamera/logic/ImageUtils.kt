package com.grovkornet.nativefilmcamera.logic

import android.graphics.Bitmap
import android.graphics.Rect
import kotlin.math.abs

object ImageUtils {
    fun calculateCropRectBeforeRotation(rawWidth: Int, rawHeight: Int, rotationDegrees: Int, aspectRatioType: Int): Rect {
        var targetAspect = when (aspectRatioType) {
            0 -> 4f / 3f
            1 -> 16f / 9f
            2 -> 1f / 1f
            3 -> 3f / 2f
            4 -> 65f / 24f
            else -> return Rect(0, 0, rawWidth, rawHeight)
        }

        val rotatedWidth = if (rotationDegrees == 90 || rotationDegrees == 270) rawHeight else rawWidth
        val rotatedHeight = if (rotationDegrees == 90 || rotationDegrees == 270) rawWidth else rawHeight
        val isPortrait = rotatedHeight > rotatedWidth

        if (isPortrait) {
            targetAspect = 1f / targetAspect
        }

        val rawTargetAspect = if (rotationDegrees == 90 || rotationDegrees == 270) {
            1f / targetAspect
        } else {
            targetAspect
        }

        val currentAspect = rawWidth.toFloat() / rawHeight.toFloat()
        
        if (abs(currentAspect - rawTargetAspect) < 0.01) return Rect(0, 0, rawWidth, rawHeight)

        var targetWidth = rawWidth
        var targetHeight = rawHeight

        if (currentAspect > rawTargetAspect) {
            targetWidth = (rawHeight * rawTargetAspect).toInt()
        } else {
            targetHeight = (rawWidth / rawTargetAspect).toInt()
        }

        val x = (rawWidth - targetWidth) / 2
        val y = (rawHeight - targetHeight) / 2

        val finalX = maxOf(0, x)
        val finalY = maxOf(0, y)
        val finalW = minOf(rawWidth - finalX, targetWidth)
        val finalH = minOf(rawHeight - finalY, targetHeight)

        return Rect(finalX, finalY, finalX + finalW, finalY + finalH)
    }

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
