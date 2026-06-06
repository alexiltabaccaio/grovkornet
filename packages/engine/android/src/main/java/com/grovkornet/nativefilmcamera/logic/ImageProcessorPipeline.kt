package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.state.CameraConfiguration

object ImageProcessorPipeline {
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
            // scale down without filtering to maintain retro look if small
            val scaled = Bitmap.createScaledBitmap(
                bitmap, 
                (bitmap.width * scale).toInt(), 
                (bitmap.height * scale).toInt(), 
                targetRes > 480
            )
            if (scaled != bitmap) {
                bitmap.recycle()
                return scaled
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
