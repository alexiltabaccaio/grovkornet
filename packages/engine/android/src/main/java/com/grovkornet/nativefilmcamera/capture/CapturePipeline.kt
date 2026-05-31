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
import com.grovkornet.nativefilmcamera.BuildConfig
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

    private val activeCaptures = java.util.concurrent.atomic.AtomicInteger(0)
    private var releasePending = false

    fun takePicture(imageCapture: ImageCapture) {
        shutterSound.play(MediaActionSound.SHUTTER_CLICK)
        activeCaptures.incrementAndGet()
        
        scope.launch {
            try {
                val imageProxy = captureImage(imageCapture)
                processAndSave(imageProxy)
            } catch (e: Exception) {
                Log.e(TAG, "Capture or processing failed", e)
            } finally {
                if (activeCaptures.decrementAndGet() == 0 && releasePending) {
                    offscreenProcessor.release()
                    onCapturesFinished?.invoke()
                }
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
        val originalExifMap = mutableMapOf<String, String>()
        
        try {
            val rotation = image.imageInfo.rotationDegrees
            val buffer = image.planes[0].buffer
            val bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
            
            try {
                java.io.ByteArrayInputStream(bytes).use { stream ->
                    val originalExif = android.media.ExifInterface(stream)
                    val tagsToCopy = arrayOf(
                        android.media.ExifInterface.TAG_F_NUMBER,
                        android.media.ExifInterface.TAG_ISO_SPEED_RATINGS,
                        android.media.ExifInterface.TAG_EXPOSURE_TIME,
                        android.media.ExifInterface.TAG_FOCAL_LENGTH,
                        android.media.ExifInterface.TAG_WHITE_BALANCE,
                        android.media.ExifInterface.TAG_FLASH,
                        android.media.ExifInterface.TAG_GPS_LATITUDE,
                        android.media.ExifInterface.TAG_GPS_LATITUDE_REF,
                        android.media.ExifInterface.TAG_GPS_LONGITUDE,
                        android.media.ExifInterface.TAG_GPS_LONGITUDE_REF,
                        android.media.ExifInterface.TAG_GPS_ALTITUDE,
                        android.media.ExifInterface.TAG_GPS_ALTITUDE_REF,
                        android.media.ExifInterface.TAG_GPS_PROCESSING_METHOD,
                        android.media.ExifInterface.TAG_GPS_TIMESTAMP,
                        android.media.ExifInterface.TAG_GPS_DATESTAMP
                    )
                    for (tag in tagsToCopy) {
                        originalExif.getAttribute(tag)?.let { value ->
                            originalExifMap[tag] = value
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to read original EXIF metadata", e)
            }

            val rawBitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            if (rotation != 0 || config.isSelfieCamera) {
                val matrix = Matrix().apply { 
                    postRotate(rotation.toFloat())
                    if (config.isSelfieCamera) {
                        postScale(-1f, 1f)
                    }
                }
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

            // Process the full-resolution image
            val processed = offscreenProcessor.process(finalInput, config, context)
            finalInput.recycle()

            val watermarked = WatermarkEngine.embedSignature(processed)
            if (watermarked != processed) {
                processed.recycle()
            }

            // 1. Get URI from MediaStore
            val uri = galleryManager.createGalleryUri()
            if (uri == null) {
                Log.e(TAG, "Failed to create Gallery URI")
                watermarked.recycle()
                return@withContext
            }

            // 2. Compress directly to MediaStore
            context.contentResolver.openOutputStream(uri)?.use { os ->
                watermarked.compress(Bitmap.CompressFormat.JPEG, 95, os)
            }
            watermarked.recycle()

            // 3. Write EXIF directly to MediaStore URI
            try {
                context.contentResolver.openFileDescriptor(uri, "rw")?.use { pfd ->
                    val exif = android.media.ExifInterface(pfd.fileDescriptor)
                    val sdf = java.text.SimpleDateFormat("yyyy:MM:dd HH:mm:ss", java.util.Locale.US)
                    val now = sdf.format(java.util.Date())
                    exif.setAttribute(android.media.ExifInterface.TAG_DATETIME, now)
                    exif.setAttribute(android.media.ExifInterface.TAG_DATETIME_ORIGINAL, now)
                    exif.setAttribute(android.media.ExifInterface.TAG_DATETIME_DIGITIZED, now)
                    exif.setAttribute(android.media.ExifInterface.TAG_SOFTWARE, "Grovkornet Engine")
                    exif.setAttribute(android.media.ExifInterface.TAG_MAKE, android.os.Build.MANUFACTURER)
                    exif.setAttribute(android.media.ExifInterface.TAG_MODEL, android.os.Build.MODEL)
                    exif.setAttribute(android.media.ExifInterface.TAG_RESOLUTION_UNIT, "2")
                    exif.setAttribute(android.media.ExifInterface.TAG_X_RESOLUTION, "72/1")
                    exif.setAttribute(android.media.ExifInterface.TAG_Y_RESOLUTION, "72/1")
                    
                    // Copy original EXIF tags back
                    for ((tag, value) in originalExifMap) {
                        exif.setAttribute(tag, value)
                    }
                    
                    exif.saveAttributes()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to write EXIF data", e)
            }

            withContext(Dispatchers.Main) {
                listener.onPhotoCaptured(uri.toString())
            }
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "Processing complete in ${System.currentTimeMillis() - procStartTime}ms: $uri")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to process photo", e)
        }
    }

    fun hasActiveCaptures(): Boolean = activeCaptures.get() > 0

    private var onCapturesFinished: (() -> Unit)? = null

    fun setOnCapturesFinishedListener(listener: () -> Unit) {
        onCapturesFinished = listener
    }

    fun release() {
        if (activeCaptures.get() > 0) {
            releasePending = true
            Log.i(TAG, "Release deferred: ${activeCaptures.get()} captures still processing")
        } else {
            offscreenProcessor.release()
            onCapturesFinished?.invoke()
        }
    }
}
