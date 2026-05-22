#include <gtest/gtest.h>
#include "MatrixTransformCalculator.h"

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
