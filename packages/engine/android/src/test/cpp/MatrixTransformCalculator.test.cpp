#include <gtest/gtest.h>
#include "utils/MatrixTransformCalculator.h"

TEST(MatrixTransformCalculatorTest, BasicMatrixOperations) {
    float identity[16];
    MatrixTransformCalculator::setIdentityM(identity);
    EXPECT_FLOAT_EQ(identity[0], 1.0f);
    EXPECT_FLOAT_EQ(identity[5], 1.0f);
    EXPECT_FLOAT_EQ(identity[10], 1.0f);
    EXPECT_FLOAT_EQ(identity[15], 1.0f);
    EXPECT_FLOAT_EQ(identity[1], 0.0f);

    float scale[16];
    MatrixTransformCalculator::setIdentityM(scale);
    MatrixTransformCalculator::scaleM(scale, 2.0f, 3.0f, 1.0f);
    EXPECT_FLOAT_EQ(scale[0], 2.0f);
    EXPECT_FLOAT_EQ(scale[5], 3.0f);
    EXPECT_FLOAT_EQ(scale[10], 1.0f);
    EXPECT_FLOAT_EQ(scale[15], 1.0f);

    float translate[16];
    MatrixTransformCalculator::setIdentityM(translate);
    MatrixTransformCalculator::translateM(translate, 0.5f, -0.5f, 0.0f);
    EXPECT_FLOAT_EQ(translate[12], 0.5f);
    EXPECT_FLOAT_EQ(translate[13], -0.5f);
    EXPECT_FLOAT_EQ(translate[14], 0.0f);
    EXPECT_FLOAT_EQ(translate[15], 1.0f);
}

TEST(MatrixTransformCalculatorTest, ViewportCalculations) {
    float identityScale[16];
    MatrixTransformCalculator::setIdentityM(identityScale);

    // Scale 1x1, full size
    ViewportRect vp1 = MatrixTransformCalculator::calculateViewport(identityScale, 1000, 800);
    EXPECT_EQ(vp1.width, 1000);
    EXPECT_EQ(vp1.height, 800);
    EXPECT_EQ(vp1.x, 0);
    EXPECT_EQ(vp1.y, 0);

    // Scale 0.5x0.5, half size centered
    float halfScale[16];
    MatrixTransformCalculator::setIdentityM(halfScale);
    MatrixTransformCalculator::scaleM(halfScale, 0.5f, 0.5f, 1.0f);

    ViewportRect vp2 = MatrixTransformCalculator::calculateViewport(halfScale, 1000, 800);
    EXPECT_EQ(vp2.width, 500);
    EXPECT_EQ(vp2.height, 400);
    EXPECT_EQ(vp2.x, 250);
    EXPECT_EQ(vp2.y, 200);
}
