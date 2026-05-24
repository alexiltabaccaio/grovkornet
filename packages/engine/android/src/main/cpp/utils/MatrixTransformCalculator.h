#ifndef MATRIX_TRANSFORM_CALCULATOR_H
#define MATRIX_TRANSFORM_CALCULATOR_H

class MatrixTransformCalculator {
public:
    static void calculateScaleAndCrop(
        int cameraWidth,
        int cameraHeight,
        int viewportWidth,
        int viewportHeight,
        int aspectRatioSetting,
        float* outScaleMatrix,
        float* outCropMatrix
    );

    // Matrix helpers
    static void setIdentityM(float* m);
    static void scaleM(float* m, float x, float y, float z);
    static void translateM(float* m, float x, float y, float z);
    static void multiplyMM(float* out, const float* lhs, const float* rhs);
};

#endif // MATRIX_TRANSFORM_CALCULATOR_H
