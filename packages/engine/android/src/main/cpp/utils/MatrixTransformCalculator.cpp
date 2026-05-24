#include "MatrixTransformCalculator.h"


void MatrixTransformCalculator::setIdentityM(float* m) {
    for (int i = 0; i < 16; ++i) m[i] = 0.0f;
    m[0] = 1.0f;
    m[5] = 1.0f;
    m[10] = 1.0f;
    m[15] = 1.0f;
}

void MatrixTransformCalculator::scaleM(float* m, float x, float y, float z) {
    m[0] *= x;  m[1] *= x;  m[2] *= x;  m[3] *= x;
    m[4] *= y;  m[5] *= y;  m[6] *= y;  m[7] *= y;
    m[8] *= z;  m[9] *= z;  m[10] *= z; m[11] *= z;
}

void MatrixTransformCalculator::translateM(float* m, float x, float y, float z) {
    for (int i = 0; i < 4; ++i) {
        m[12 + i] += m[i] * x + m[4 + i] * y + m[8 + i] * z;
    }
}

void MatrixTransformCalculator::multiplyMM(float* out, const float* lhs, const float* rhs) {
    float tmp[16];
    for (int i = 0; i < 4; ++i) { // Column of rhs
        for (int j = 0; j < 4; ++j) { // Row of lhs
            float sum = 0.0f;
            for (int k = 0; k < 4; ++k) {
                sum += lhs[k * 4 + j] * rhs[i * 4 + k];
            }
            tmp[i * 4 + j] = sum;
        }
    }
    for (int i = 0; i < 16; ++i) out[i] = tmp[i];
}

void MatrixTransformCalculator::calculateScaleAndCrop(
    int cameraWidth,
    int cameraHeight,
    int viewportWidth,
    int viewportHeight,
    int aspectRatioSetting,
    float* outScaleMatrix,
    float* outCropMatrix
) {
    float scaleX = 1.0f;
    float scaleY = 1.0f;
    float cropX = 1.0f;
    float cropY = 1.0f;

    if (cameraWidth > 0 && cameraHeight > 0 && viewportWidth > 0 && viewportHeight > 0) {
        bool isViewPortrait = viewportWidth < viewportHeight;
        bool isCameraPortrait = cameraWidth < cameraHeight;

        float effCamWidth = (isViewPortrait == isCameraPortrait) ? static_cast<float>(cameraWidth) : static_cast<float>(cameraHeight);
        float effCamHeight = (isViewPortrait == isCameraPortrait) ? static_cast<float>(cameraHeight) : static_cast<float>(cameraWidth);

        float viewAspect = static_cast<float>(viewportWidth) / static_cast<float>(viewportHeight);
        float targetAspect = 4.0f / 3.0f;
        switch (aspectRatioSetting) {
            case 0: targetAspect = 4.0f / 3.0f; break;
            case 1: targetAspect = 16.0f / 9.0f; break;
            case 2: targetAspect = 1.0f / 1.0f; break;
            case 3: targetAspect = 3.0f / 2.0f; break;
            case 4: targetAspect = 65.0f / 24.0f; break;
            default: targetAspect = 4.0f / 3.0f; break;
        }

        float camAspect = effCamWidth / effCamHeight;

        // First: Scale the GEOMETRY to fit the target aspect ratio into the viewport (Letterbox/Fill)
        float finalTargetAspect = isViewPortrait ? (1.0f / targetAspect) : targetAspect;

        if (viewAspect > finalTargetAspect) {
            // Viewport is wider than target -> Letterbox on sides (scaleX < 1)
            scaleX = finalTargetAspect / viewAspect;
        } else {
            // Viewport is taller than target -> Letterbox on top/bottom (scaleY < 1)
            scaleY = viewAspect / finalTargetAspect;
        }

        // Second: Crop the TEXTURE to match the target aspect ratio
        if (finalTargetAspect > camAspect) {
            // Target is wider than camera. Crop camera vertically.
            cropY = camAspect / finalTargetAspect;
        } else {
            // Target is taller than camera. Crop camera horizontally.
            cropX = finalTargetAspect / camAspect;
        }
    }

    setIdentityM(outScaleMatrix);
    scaleM(outScaleMatrix, scaleX, scaleY, 1.0f);

    setIdentityM(outCropMatrix);
    // Texture coords are 0 to 1. To crop the center, translate to center (0.5), scale down, translate back.
    translateM(outCropMatrix, 0.5f, 0.5f, 0.0f);
    scaleM(outCropMatrix, cropX, cropY, 1.0f);
    translateM(outCropMatrix, -0.5f, -0.5f, 0.0f);
}

ViewportRect MatrixTransformCalculator::calculateViewport(
    const float* scaleMatrix,
    int viewportWidth,
    int viewportHeight
) {
    float scaleX = scaleMatrix[0];
    float scaleY = scaleMatrix[5];
    int vpWidth = static_cast<int>(viewportWidth * scaleX);
    int vpHeight = static_cast<int>(viewportHeight * scaleY);
    int vpX = (viewportWidth - vpWidth) / 2;
    int vpY = (viewportHeight - vpHeight) / 2;

    return ViewportRect{vpX, vpY, vpWidth, vpHeight};
}
