package com.grovkornet.nativefilmcamera.rendering.utils

import android.opengl.Matrix

class MatrixTransformCalculator {

    fun calculateScaleAndCrop(
        cameraWidth: Int,
        cameraHeight: Int,
        viewportWidth: Int,
        viewportHeight: Int,
        aspectRatioSetting: Int,
        outScaleMatrix: FloatArray,
        outCropMatrix: FloatArray
    ) {
        var scaleX = 1.0f
        var scaleY = 1.0f
        var cropX = 1.0f
        var cropY = 1.0f

        if (cameraWidth > 0 && cameraHeight > 0 && viewportWidth > 0 && viewportHeight > 0) {
            val isViewPortrait = viewportWidth < viewportHeight
            val isCameraPortrait = cameraWidth < cameraHeight
            
            val effCamWidth = if (isViewPortrait == isCameraPortrait) cameraWidth.toFloat() else cameraHeight.toFloat()
            val effCamHeight = if (isViewPortrait == isCameraPortrait) cameraHeight.toFloat() else cameraWidth.toFloat()

            val viewAspect = viewportWidth.toFloat() / viewportHeight.toFloat()
            val targetAspect = when (aspectRatioSetting) {
                0 -> 4f / 3f
                1 -> 16f / 9f
                2 -> 1f / 1f
                3 -> 3f / 2f
                4 -> 65f / 24f
                else -> 4f / 3f
            }
            
            val camAspect = effCamWidth / effCamHeight

            // First: Scale the GEOMETRY to fit the target aspect ratio into the viewport (Letterbox/Fill)
            val finalTargetAspect = if (isViewPortrait) 1f / targetAspect else targetAspect
            
            if (viewAspect > finalTargetAspect) {
                // Viewport is wider than target -> Letterbox on sides (scaleX < 1)
                scaleX = finalTargetAspect / viewAspect
            } else {
                // Viewport is taller than target -> Letterbox on top/bottom (scaleY < 1)
                scaleY = viewAspect / finalTargetAspect
            }
            
            // Second: Crop the TEXTURE to match the target aspect ratio
            if (finalTargetAspect > camAspect) {
                // Target is wider than camera. Crop camera vertically.
                // e.g. camera is 0.75 (4:3), target is 1.0 (1:1). We need to shrink the height we sample.
                cropY = camAspect / finalTargetAspect
            } else {
                // Target is taller than camera. Crop camera horizontally.
                cropX = finalTargetAspect / camAspect
            }
        }

        Matrix.setIdentityM(outScaleMatrix, 0)
        Matrix.scaleM(outScaleMatrix, 0, scaleX, scaleY, 1.0f)

        Matrix.setIdentityM(outCropMatrix, 0)
        // Texture coords are 0 to 1. To crop the center, translate to center (0.5), scale down, translate back.
        Matrix.translateM(outCropMatrix, 0, 0.5f, 0.5f, 0.0f)
        Matrix.scaleM(outCropMatrix, 0, cropX, cropY, 1.0f)
        Matrix.translateM(outCropMatrix, 0, -0.5f, -0.5f, 0.0f)
    }
}
