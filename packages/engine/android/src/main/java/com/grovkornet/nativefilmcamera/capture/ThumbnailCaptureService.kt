package com.grovkornet.nativefilmcamera.capture

import android.graphics.Bitmap
import android.view.PixelCopy
import android.view.SurfaceView
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.File
import android.net.Uri
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.grovkornet.nativefilmcamera.BuildConfig

object ThumbnailCaptureService {
    fun captureThumbnail(
        view: SurfaceView,
        surfaceWidth: Int,
        surfaceHeight: Int,
        onThumbnailCaptured: (String) -> Unit,
        pixelCopyAction: (SurfaceView, Bitmap, PixelCopy.OnPixelCopyFinishedListener, Handler) -> Unit = { v, b, l, h ->
            PixelCopy.request(v, b, l, h)
        }
    ) {
        if (surfaceWidth <= 0 || surfaceHeight <= 0 || !view.holder.surface.isValid) {
            if (BuildConfig.DEBUG) {
                Log.w("ThumbnailCaptureService", "Cannot request PixelCopy: surface not ready")
            }
            return
        }

        val scale = 256f / maxOf(surfaceWidth, surfaceHeight).toFloat()
        val tw = maxOf(1, (surfaceWidth * scale).toInt())
        val th = maxOf(1, (surfaceHeight * scale).toInt())

        val bitmap = Bitmap.createBitmap(tw, th, Bitmap.Config.ARGB_8888)
        try {
            pixelCopyAction(view, bitmap, { result ->
                if (result == PixelCopy.SUCCESS) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val context = view.context
                            val previewFile = File(context.cacheDir, "preview_capture_${System.currentTimeMillis()}.jpg")
                            previewFile.outputStream().use { os ->
                                bitmap.compress(Bitmap.CompressFormat.JPEG, 50, os)
                            }
                            val previewUri = Uri.fromFile(previewFile).toString()
                            withContext(Dispatchers.Main) {
                                onThumbnailCaptured(previewUri)
                            }
                        } catch (e: Exception) {
                            Log.e("ThumbnailCaptureService", "Failed to save PixelCopy thumbnail", e)
                        } finally {
                            bitmap.recycle()
                        }
                    }
                } else {
                    Log.e("ThumbnailCaptureService", "PixelCopy failed with result: $result")
                    bitmap.recycle()
                }
            }, Handler(Looper.getMainLooper()))
        } catch (e: Exception) {
            Log.e("ThumbnailCaptureService", "Failed to request PixelCopy", e)
            bitmap.recycle()
        }
    }
}
