package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapRegionDecoder
import android.graphics.Matrix
import android.graphics.Rect
import android.os.Build
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

object ImageProcessorPipeline {
    fun processRawCaptureBytes(
        bytes: ByteArray,
        rotationDegrees: Int,
        config: CameraConfiguration
    ): Bitmap? {
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
        val rawWidth = options.outWidth
        val rawHeight = options.outHeight

        if (rawWidth <= 0 || rawHeight <= 0) return null

        val cropRect = ImageUtils.calculateCropRectBeforeRotation(
            rawWidth,
            rawHeight,
            rotationDegrees,
            config.aspectRatio
        )

        val targetRes = when (config.resolutionSetting) {
            0 -> 2160
            1 -> 1440
            2 -> 1080
            3 -> 720
            4 -> 480
            5 -> 360
            6 -> 240
            7 -> 144
            else -> 1080
        }

        val minDimension = minOf(cropRect.width(), cropRect.height())
        var inSampleSize = 1
        while (minDimension / (inSampleSize * 2) >= targetRes) {
            inSampleSize *= 2
        }

        options.inJustDecodeBounds = false
        options.inSampleSize = inSampleSize

        var regionBitmap: Bitmap? = null
        try {
            val decoder = if (Build.VERSION.SDK_INT >= 31) {
                BitmapRegionDecoder.newInstance(bytes, 0, bytes.size)
            } else {
                @Suppress("DEPRECATION")
                BitmapRegionDecoder.newInstance(bytes, 0, bytes.size, false)
            }
            
            if (decoder != null) {
                try {
                    regionBitmap = decoder.decodeRegion(cropRect, options)
                } finally {
                    decoder.recycle()
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("ImageProcessorPipeline", "Failed to decode region", e)
        }

        if (regionBitmap == null) {
            try {
                options.inSampleSize = inSampleSize
                val full = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
                if (full != null) {
                    regionBitmap = ImageUtils.cropToAspectRatio(full, config.aspectRatio)
                    if (regionBitmap != full) {
                        full.recycle()
                    }
                }
            } catch (e: Exception) {
                android.util.Log.e("ImageProcessorPipeline", "Fallback decode failed", e)
            }
        }

        val decoded = regionBitmap ?: return null

        val matrix = Matrix()
        if (rotationDegrees != 0) {
            matrix.postRotate(rotationDegrees.toFloat())
        }
        if (config.isSelfieCamera) {
            matrix.postScale(-1f, 1f)
        }

        val currentMin = minOf(decoded.width, decoded.height)
        val scale = targetRes.toFloat() / currentMin.toFloat()

        if (scale < 1.0f) {
            matrix.postScale(scale, scale)
        }

        val useFilter = targetRes > 480
        val finalBitmap = try {
            Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, useFilter)
        } catch (e: Exception) {
            android.util.Log.e("ImageProcessorPipeline", "Matrix transform failed", e)
            null
        }

        if (finalBitmap != decoded) {
            decoded.recycle()
        }

        return finalBitmap
    }

    fun rotateAndMirror(rawBitmap: Bitmap, rotationDegrees: Int, isSelfie: Boolean): Bitmap {
        if (rotationDegrees != 0 || isSelfie) {
            val matrix = Matrix().apply { 
                postRotate(rotationDegrees.toFloat())
                if (isSelfie) {
                    postScale(-1f, 1f)
                }
            }
            val result = Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
            rawBitmap.recycle()
            return result
        }
        return rawBitmap
    }

    fun scaleToTargetResolution(bitmap: Bitmap, resolutionSetting: Int): Bitmap {
        val targetRes = when (resolutionSetting) {
            0 -> 2160
            1 -> 1440
            2 -> 1080
            3 -> 720
            4 -> 480
            5 -> 360
            6 -> 240
            7 -> 144
            else -> 1080
        }
        
        val scale = targetRes.toFloat() / minOf(bitmap.width, bitmap.height).toFloat()
        if (scale < 1f) {
            val useFilter = targetRes > 480
            val targetWidth = (bitmap.width * scale).toInt()
            val targetHeight = (bitmap.height * scale).toInt()

            if (useFilter) {
                var currentBitmap = bitmap
                var currentWidth = bitmap.width
                var currentHeight = bitmap.height

                // Progressive downscaling by halves for high-quality anti-aliasing
                while (currentWidth / 2 >= targetWidth && currentHeight / 2 >= targetHeight) {
                    currentWidth /= 2
                    currentHeight /= 2
                    val halfScaled = Bitmap.createScaledBitmap(currentBitmap, currentWidth, currentHeight, true)
                    if (currentBitmap != bitmap && currentBitmap != halfScaled) {
                        currentBitmap.recycle()
                    }
                    currentBitmap = halfScaled
                }

                val finalScaled = Bitmap.createScaledBitmap(currentBitmap, targetWidth, targetHeight, true)
                if (currentBitmap != bitmap && currentBitmap != finalScaled) {
                    currentBitmap.recycle()
                }

                if (finalScaled != bitmap) {
                    bitmap.recycle()
                }
                return finalScaled
            } else {
                // scale down without filtering to maintain retro look if small
                val scaled = Bitmap.createScaledBitmap(
                    bitmap, 
                    targetWidth, 
                    targetHeight, 
                    false
                )
                if (scaled != bitmap) {
                    bitmap.recycle()
                    return scaled
                }
            }
        }
        return bitmap
    }

    suspend fun processRenderPipeline(
        bitmap: Bitmap,
        config: CameraConfiguration,
        context: Context,
        processor: OffscreenFilmProcessor
    ): Bitmap {
        return processor.process(bitmap, config, context)
    }
}
