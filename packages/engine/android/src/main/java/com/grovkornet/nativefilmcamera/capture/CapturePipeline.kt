package com.grovkornet.nativefilmcamera.capture

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
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
import com.grovkornet.nativefilmcamera.logic.ExifMetadataManager
import com.grovkornet.nativefilmcamera.logic.ImageProcessorPipeline
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import com.grovkornet.nativefilmcamera.BuildConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
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
    private val memoryMutex = Mutex()

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
        
        // 1. Light and fast extraction (allowed to run concurrently to free CameraX buffer quickly)
        val rotation = image.imageInfo.rotationDegrees
        val buffer = image.planes[0].buffer
        val bytes = ByteArray(buffer.remaining())
        buffer.get(bytes)
        
        image.close() // Unfreeze camera preview immediately!
        
        // 2. Heavy memory allocation and processing (serialized with a Mutex to prevent OOM)
        memoryMutex.withLock {
            var bitmap: Bitmap? = null
            var originalExifMap: Map<String, String> = emptyMap()
            
            try {
                originalExifMap = java.io.ByteArrayInputStream(bytes).use { stream ->
                    ExifMetadataManager.extractMetadata(stream)
                }

                val rawBitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                bitmap = ImageProcessorPipeline.rotateAndMirror(rawBitmap, rotation, config.isSelfieCamera)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to decode photo buffer", e)
            }

            if (bitmap == null) return@withLock

            try {
                // Crop to target aspect ratio
                val cropped = ImageUtils.cropToAspectRatio(bitmap, config.aspectRatio)
                if (cropped != bitmap) {
                    bitmap.recycle()
                    bitmap = cropped
                }

                // Scale to target resolution
                val scaled = ImageProcessorPipeline.scaleToTargetResolution(bitmap, config.resolutionSetting)
                
                // Process the full-resolution image
                val processed = ImageProcessorPipeline.processRenderPipeline(scaled, config, context, offscreenProcessor)
                if (scaled != processed) {
                    scaled.recycle()
                }

                val watermarked = WatermarkEngine.embedSignature(processed)
                if (watermarked != processed) {
                    processed.recycle()
                }

                // 1. Get URI from MediaStore
                val uri = galleryManager.createGalleryUri()
                if (uri == null) {
                    Log.e(TAG, "Failed to create Gallery URI")
                    watermarked.recycle()
                    return@withLock
                }

                // 2. Compress directly to MediaStore
                context.contentResolver.openOutputStream(uri)?.use { os ->
                    watermarked.compress(Bitmap.CompressFormat.JPEG, 95, os)
                }
                watermarked.recycle()

                // 3. Write EXIF directly to MediaStore URI
                ExifMetadataManager.writeMetadata(context, uri, originalExifMap)

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
    }

    fun hasActiveCaptures(): Boolean = activeCaptures.get() > 0

    private var onCapturesFinished: (() -> Unit)? = null

    fun setOnCapturesFinishedListener(listener: () -> Unit) {
        onCapturesFinished = listener
    }

    fun release() {
        if (activeCaptures.get() > 0) {
            releasePending = true
            if (BuildConfig.DEBUG) {
                Log.i(TAG, "Release deferred: ${activeCaptures.get()} captures still processing")
            }
        } else {
            offscreenProcessor.release()
            onCapturesFinished?.invoke()
        }
    }
}
