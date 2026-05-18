package com.grovkornet.nativefilmcamera.logic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapRegionDecoder
import android.graphics.Color
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.os.ParcelFileDescriptor
import android.media.ExifInterface
import android.util.Log
import kotlin.math.cos
import kotlin.math.PI
import kotlin.math.sqrt

object WatermarkEngine {
    private const val TAG = "WatermarkEngine"
    private const val SIGNATURE: Long = 0x47524F564B4F524E // "GROVKORN"
    private const val ALPHA = 12.0 // Robustness strength for DCT coefficients
    private const val MATCH_THRESHOLD = 54 // Allow up to 10 bit errors out of 64 for robustness

    // Precomputed cosine tables for 8x8 DCT
    private val cosTable = Array(8) { x ->
        DoubleArray(8) { u ->
            cos((2 * x + 1) * u * PI / 16.0)
        }
    }
    private val cTable = DoubleArray(8) { u ->
        if (u == 0) 1.0 / sqrt(2.0) else 1.0
    }

    /**
     * Embeds a 64-bit DCT watermark into the top-left 64x64 region of the bitmap.
     */
    fun embedSignature(bitmap: Bitmap): Bitmap {
        val startTime = System.currentTimeMillis()
        if (bitmap.width < 64 || bitmap.height < 64) {
            Log.w(TAG, "Bitmap too small for DCT watermark")
            return bitmap
        }

        val output = if (bitmap.isMutable) bitmap else bitmap.copy(Bitmap.Config.ARGB_8888, true)
        val pixels = IntArray(64 * 64)
        output.getPixels(pixels, 0, 64, 0, 0, 64, 64)

        // Process 64 blocks of 8x8
        for (blockIndex in 0 until 64) {
            val startX = (blockIndex % 8) * 8
            val startY = (blockIndex / 8) * 8
            val bit = (SIGNATURE ushr (63 - blockIndex)) and 1L

            // 1. Extract Y (Luma) channel for 8x8 block
            val luma = Array(8) { DoubleArray(8) }
            val alphaCbCr = Array(8) { IntArray(8) } // Store A, Cb, Cr to reconstruct RGB later

            for (y in 0 until 8) {
                for (x in 0 until 8) {
                    val color = pixels[(startY + y) * 64 + (startX + x)]
                    val r = Color.red(color)
                    val g = Color.green(color)
                    val b = Color.blue(color)

                    // Standard RGB to YCbCr (Y is Luma)
                    luma[y][x] = 0.299 * r + 0.587 * g + 0.114 * b
                    alphaCbCr[y][x] = color and 0xFF000000.toInt() // Store Alpha
                }
            }

            // 2. Forward 8x8 DCT
            val dct = Array(8) { DoubleArray(8) }
            for (u in 0 until 8) {
                for (v in 0 until 8) {
                    var sum = 0.0
                    for (y in 0 until 8) {
                        for (x in 0 until 8) {
                            sum += luma[y][x] * cosTable[x][u] * cosTable[y][v]
                        }
                    }
                    dct[u][v] = 0.25 * cTable[u] * cTable[v] * sum
                }
            }

            // 3. Modulate mid-frequency coefficients (u1=3, v1=4) and (u2=4, v2=3)
            val u1 = 3; val v1 = 4
            val u2 = 4; val v2 = 3

            if (bit == 1L) {
                if (dct[u1][v1] <= dct[u2][v2] + ALPHA) {
                    val avg = (dct[u1][v1] + dct[u2][v2]) / 2.0
                    dct[u1][v1] = avg + ALPHA / 2.0
                    dct[u2][v2] = avg - ALPHA / 2.0
                }
            } else {
                if (dct[u2][v2] <= dct[u1][v1] + ALPHA) {
                    val avg = (dct[u1][v1] + dct[u2][v2]) / 2.0
                    dct[u2][v2] = avg + ALPHA / 2.0
                    dct[u1][v1] = avg - ALPHA / 2.0
                }
            }

            // 4. Inverse 8x8 DCT
            for (y in 0 until 8) {
                for (x in 0 until 8) {
                    var sum = 0.0
                    for (u in 0 until 8) {
                        for (v in 0 until 8) {
                            sum += cTable[u] * cTable[v] * dct[u][v] * cosTable[x][u] * cosTable[y][v]
                        }
                    }
                    val newY = (0.25 * sum).coerceIn(0.0, 255.0)

                    // Reconstruct RGB from new Y and original color ratios
                    val oldColor = pixels[(startY + y) * 64 + (startX + x)]
                    val oldR = Color.red(oldColor)
                    val oldG = Color.green(oldColor)
                    val oldB = Color.blue(oldColor)
                    val oldY = 0.299 * oldR + 0.587 * oldG + 0.114 * oldB

                    val diff = newY - oldY
                    val newR = (oldR + diff).toInt().coerceIn(0, 255)
                    val newG = (oldG + diff).toInt().coerceIn(0, 255)
                    val newB = (oldB + diff).toInt().coerceIn(0, 255)

                    pixels[(startY + y) * 64 + (startX + x)] = alphaCbCr[y][x] or (newR shl 16) or (newG shl 8) or newB
                }
            }
        }

        output.setPixels(pixels, 0, 64, 0, 0, 64, 64)
        Log.i(TAG, "DCT Watermark embedded in ${System.currentTimeMillis() - startTime}ms")
        return output
    }

    /**
     * Injects EXIF metadata TAG_SOFTWARE = "Grovkornet" into the saved file URI.
     */
    fun addExifMetadata(context: Context, uri: Uri) {
        try {
            context.contentResolver.openFileDescriptor(uri, "rw")?.use { pfd ->
                val exif = ExifInterface(pfd.fileDescriptor)
                exif.setAttribute(ExifInterface.TAG_SOFTWARE, "Grovkornet")
                exif.saveAttributes()
                Log.i(TAG, "EXIF metadata injected successfully into $uri")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to inject EXIF metadata", e)
        }
    }

    /**
     * Verifies if the image at the given URI is an authentic Grovkornet photo.
     * Uses EXIF fast-pass first, falls back to DCT deep-pass.
     */
    fun verifyGrovkornetAuthenticity(context: Context, uri: Uri): Boolean {
        try {
            // 1. Fast Pass: Check EXIF
            var isExifVerified = false
            context.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
                try {
                    val exif = ExifInterface(pfd.fileDescriptor)
                    if (exif.getAttribute(ExifInterface.TAG_SOFTWARE) == "Grovkornet") {
                        Log.i(TAG, "Authenticity verified via EXIF fast-pass")
                        isExifVerified = true
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "EXIF read failed", e)
                }
                Unit
            }
            if (isExifVerified) return true

            // 2. Deep Pass: Check DCT Watermark
            // We open a fresh FileDescriptor because ExifInterface advanced the file pointer,
            // which can cause BitmapRegionDecoder to hang infinitely in native code.
            context.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
                val decoder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    BitmapRegionDecoder.newInstance(pfd.fileDescriptor, false)
                } else {
                    @Suppress("DEPRECATION")
                    BitmapRegionDecoder.newInstance(pfd.fileDescriptor, false)
                }

                if (decoder == null || decoder.width < 64 || decoder.height < 64) {
                    decoder?.recycle()
                    return false
                }

                val bitmap = decoder.decodeRegion(Rect(0, 0, 64, 64), null)
                decoder.recycle()

                if (bitmap == null) return false

                val pixels = IntArray(64 * 64)
                bitmap.getPixels(pixels, 0, 64, 0, 0, 64, 64)
                bitmap.recycle()

                var matchingBits = 0
                for (blockIndex in 0 until 64) {
                    val startX = (blockIndex % 8) * 8
                    val startY = (blockIndex / 8) * 8
                    val expectedBit = (SIGNATURE ushr (63 - blockIndex)) and 1L

                    val luma = Array(8) { DoubleArray(8) }
                    for (y in 0 until 8) {
                        for (x in 0 until 8) {
                            val color = pixels[(startY + y) * 64 + (startX + x)]
                            luma[y][x] = 0.299 * Color.red(color) + 0.587 * Color.green(color) + 0.114 * Color.blue(color)
                        }
                    }

                    // We only need dct[3][4] and dct[4][3] for verification
                    val u1 = 3; val v1 = 4
                    val u2 = 4; val v2 = 3

                    var sum1 = 0.0; var sum2 = 0.0
                    for (y in 0 until 8) {
                        for (x in 0 until 8) {
                            sum1 += luma[y][x] * cosTable[x][u1] * cosTable[y][v1]
                            sum2 += luma[y][x] * cosTable[x][u2] * cosTable[y][v2]
                        }
                    }
                    val dct1 = 0.25 * cTable[u1] * cTable[v1] * sum1
                    val dct2 = 0.25 * cTable[u2] * cTable[v2] * sum2

                    val actualBit = if (dct1 > dct2) 1L else 0L
                    if (actualBit == expectedBit) matchingBits++
                }

                Log.i(TAG, "DCT Verification: $matchingBits / 64 bits matched")
                return matchingBits >= MATCH_THRESHOLD
            }
        } catch (e: Exception) {
            Log.e(TAG, "Authenticity verification failed with exception", e)
        }
        return false
    }
}
