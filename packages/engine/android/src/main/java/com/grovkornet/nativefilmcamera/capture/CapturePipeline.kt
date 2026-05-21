package com.grovkornet.nativefilmcamera.capture

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.MediaActionSound
import android.util.Log
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.core.content.ContextCompat
import com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor
import com.grovkornet.nativefilmcamera.managers.GalleryManager
import com.grovkornet.nativefilmcamera.logic.ImageUtils
import com.grovkornet.nativefilmcamera.logic.WatermarkEngine
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class CapturePipeline(
    private val context: Context,
    private val config: CameraConfiguration,
    private val galleryManager: GalleryManager,
    private val listener: Listener
) {
    private val TAG = "CapturePipeline"
    private val shutterSound = MediaActionSound().apply { load(MediaActionSound.SHUTTER_CLICK) }
    private val offscreenProcessor = OffscreenFilmProcessor()
    private val scope = CoroutineScope(Dispatchers.Default)

    interface Listener {
        fun onPhotoCaptured(uri: String)
    }

    fun takePicture(imageCapture: ImageCapture) {
        shutterSound.play(MediaActionSound.SHUTTER_CLICK)
        
        scope.launch {
            try {
                val imageProxy = captureImage(imageCapture)
                processAndSave(imageProxy)
            } catch (e: Exception) {
                Log.e(TAG, "Capture or processing failed", e)
            }
        }
    }

    private suspend fun captureImage(imageCapture: ImageCapture): ImageProxy = suspendCancellableCoroutine { cont ->
        imageCapture.takePicture(
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageCapturedCallback() {
                override fun onCaptureSuccess(image: ImageProxy) {
                    cont.resume(image)
                }

                override fun onError(exception: ImageCaptureException) {
                    cont.resumeWithException(exception)
                }
            }
        )
    }

    private suspend fun processAndSave(image: ImageProxy) = withContext(Dispatchers.Default) {
        val procStartTime = System.currentTimeMillis()
        var bitmap: Bitmap? = null
        
        try {
            val rotation = image.imageInfo.rotationDegrees
            val buffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            
            val rawBitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            if (rotation != 0) {
                val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
                bitmap = Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
                rawBitmap.recycle()
            } else {
                bitmap = rawBitmap
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to decode photo buffer", e)
        } finally {
            // Close image proxy immediately to unfreeze CameraX preview stream!
            image.close()
        }

        if (bitmap == null) return@withContext

        try {
            // Crop to target aspect ratio
            val cropped = ImageUtils.cropToAspectRatio(bitmap, config.aspectRatio)
            if (cropped != bitmap) {
                bitmap.recycle()
                bitmap = cropped
            }

            var finalInput = bitmap
            val targetRes = when(config.resolutionSetting) {
                0 -> 2160
                1 -> 1080
                2 -> 720
                3 -> 480
                4 -> 360
                5 -> 240
                6 -> 144
                else -> 1080
            }
            val scale = targetRes.toFloat() / minOf(finalInput.width, finalInput.height).toFloat()
            if (scale < 1f) {
                // scale down without filtering to maintain retro look if small
                val scaled = Bitmap.createScaledBitmap(finalInput, (finalInput.width * scale).toInt(), (finalInput.height * scale).toInt(), targetRes > 480)
                if (scaled != finalInput) {
                    finalInput.recycle()
                    finalInput = scaled
                }
            }

            // 1. Generate and emit a fast low-res preview
            val previewScale = 256f / maxOf(finalInput.width, finalInput.height).toFloat()
            if (previewScale < 1f) {
                val previewBitmap = Bitmap.createScaledBitmap(finalInput, (finalInput.width * previewScale).toInt(), (finalInput.height * previewScale).toInt(), true)
                
                // Skip native processing for the tiny thumbnail to avoid double EGL Context teardown
                // and provide instantaneous UI feedback! Ultra-compressed for speed.
                val previewFile = java.io.File(context.cacheDir, "preview_capture_${System.currentTimeMillis()}.jpg")
                previewFile.outputStream().use { os ->
                    previewBitmap.compress(Bitmap.CompressFormat.JPEG, 50, os)
                }
                previewBitmap.recycle()
                
                val previewUri = android.net.Uri.fromFile(previewFile).toString()
                withContext(Dispatchers.Main) {
                    listener.onPhotoCaptured(previewUri)
                }
            }

            // 2. Process the full-resolution image
            val processed = offscreenProcessor.process(finalInput, config, context)
            finalInput.recycle()

            val watermarked = WatermarkEngine.embedSignature(processed)
            if (watermarked != processed) {
                processed.recycle()
            }

            val tempFile = java.io.File(context.cacheDir, "temp_capture_${System.currentTimeMillis()}.jpg")
            tempFile.outputStream().use { os ->
                watermarked.compress(Bitmap.CompressFormat.JPEG, 95, os)
            }

            // Save the file to the gallery
            val uri = galleryManager.saveFileToGallery(tempFile)
            watermarked.recycle()
            tempFile.delete()

            uri?.let { 
                withContext(Dispatchers.Main) {
                    listener.onPhotoCaptured(it.toString())
                }
            }
            Log.i(TAG, "Processing complete in ${System.currentTimeMillis() - procStartTime}ms: $uri")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to process photo", e)
        }
    }

    fun release() {
        offscreenProcessor.release()
    }
}
