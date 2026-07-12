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
                    if (cont.isActive) {
                        cont.resume(image)
                    } else {
                        image.close()
                    }
                }

                override fun onError(exception: ImageCaptureException) {
                    if (cont.isActive) {
                        cont.resumeWithException(exception)
                    }
                }
            }
        )
    }

    private suspend fun processAndSave(image: ImageProxy) = withContext(Dispatchers.Default) {
        val procStartTime = System.currentTimeMillis()
        
        val rotation: Int
        val bytes: ByteArray
        try {
            // 1. Light and fast extraction (allowed to run concurrently to free CameraX buffer quickly)
            rotation = image.imageInfo.rotationDegrees
            val buffer = image.planes[0].buffer
            bytes = ByteArray(buffer.remaining())
            buffer.get(bytes)
        } finally {
            image.close() // Unfreeze camera preview immediately!
        }
        
        // 2. Heavy memory allocation and processing (serialized with a Mutex to prevent OOM)
        memoryMutex.withLock {
            var scaled: Bitmap? = null
            var processed: Bitmap? = null
            var watermarked: Bitmap? = null
            var originalExifMap: Map<String, String> = emptyMap()
            
            try {
                originalExifMap = java.io.ByteArrayInputStream(bytes).use { stream ->
                    ExifMetadataManager.extractMetadata(stream)
                }

                scaled = ImageProcessorPipeline.processRawCaptureBytes(bytes, rotation, config)
                if (scaled == null) return@withLock

                // Process the full-resolution image
                processed = ImageProcessorPipeline.processRenderPipeline(scaled, config, context, offscreenProcessor)
                if (scaled != processed) {
                    scaled.recycle()
                }

                watermarked = WatermarkEngine.embedSignature(processed)
                if (watermarked != processed) {
                    processed.recycle()
                }

                // 1. Get URI from MediaStore
                val uri = galleryManager.createGalleryUri()
                if (uri == null) {
                    Log.e(TAG, "Failed to create Gallery URI")
                    return@withLock
                }

                // 2. Compress directly to MediaStore
                context.contentResolver.openOutputStream(uri)?.use { os ->
                    watermarked.compress(Bitmap.CompressFormat.JPEG, 100, os)
                }

                // 3. Write EXIF directly to MediaStore URI
                ExifMetadataManager.writeMetadata(context, uri, originalExifMap)

                withContext(Dispatchers.Main) {
                    listener.onPhotoCaptured(uri.toString())
                }

                if (BuildConfig.DEBUG) {
                    Log.d(TAG, "Processing complete in ${System.currentTimeMillis() - procStartTime}ms: $uri")
                }
            } catch (e: Throwable) {
                Log.e(TAG, "Failed to process photo", e)
            } finally {
                // Prevent memory leaks by freeing all resources allocated in this scope
                scaled?.takeIf { !it.isRecycled }?.recycle()
                processed?.takeIf { !it.isRecycled }?.recycle()
                watermarked?.takeIf { !it.isRecycled }?.recycle()
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
