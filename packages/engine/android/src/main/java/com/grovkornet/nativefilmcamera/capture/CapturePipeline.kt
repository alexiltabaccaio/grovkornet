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
        try {
            val rotation = image.imageInfo.rotationDegrees
            val buffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            
            var bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            if (rotation != 0) {
                val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
                val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
                bitmap.recycle()
                bitmap = rotated
            }

            // Crop to target aspect ratio
            val cropped = ImageUtils.cropToAspectRatio(bitmap, config.aspectRatio)
            if (cropped != bitmap) {
                bitmap.recycle()
                bitmap = cropped
            }

            val params = OffscreenFilmProcessor.Parameters(
                saturation = config.saturation,
                contrast = config.contrast,
                aberration = config.aberration,
                aberrationDirection = config.aberrationDirection,
                grainIntensity = config.grainIntensity,
                grainChroma = config.grainChroma,
                grainSize = config.grainSize,
                grainEnabled = config.grainEnabled,
                ev = config.ev,
                whiteBalance = config.whiteBalance,
                sharpening = config.sharpening,
                time = (System.currentTimeMillis() % 10000) / 1000f,
                viewportWidth = config.viewportWidth,
                viewportHeight = config.viewportHeight
            )

            val processed = offscreenProcessor.process(bitmap, params)
            bitmap.recycle()

            val watermarked = WatermarkEngine.embedSignature(processed)
            if (watermarked != processed) {
                processed.recycle()
            }

            val tempFile = java.io.File(context.cacheDir, "temp_capture_${System.currentTimeMillis()}.jpg")
            tempFile.outputStream().use { os ->
                watermarked.compress(Bitmap.CompressFormat.JPEG, 95, os)
            }

            // Inject EXIF into the temporary file
            val exif = android.media.ExifInterface(tempFile.absolutePath)
            exif.setAttribute(android.media.ExifInterface.TAG_SOFTWARE, "Grovkornet")
            exif.saveAttributes()

            // Save the file with EXIF to the gallery
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
        } finally {
            image.close()
        }
    }

    fun release() {
        offscreenProcessor.release()
    }
}
