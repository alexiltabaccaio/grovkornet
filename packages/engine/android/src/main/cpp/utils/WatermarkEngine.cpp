#include "WatermarkEngine.h"
#include <cmath>
#include <algorithm>

double WatermarkEngine::cosTable[8][8];
double WatermarkEngine::cTable[8];
bool WatermarkEngine::tablesInitialized = false;

void WatermarkEngine::initTables() {
    if (tablesInitialized) return;
    const double PI_VAL = 3.14159265358979323846;
    for (int x = 0; x < 8; ++x) {
        for (int u = 0; u < 8; ++u) {
            cosTable[x][u] = std::cos((2 * x + 1) * u * PI_VAL / 16.0);
        }
    }
    for (int u = 0; u < 8; ++u) {
        cTable[u] = (u == 0) ? (1.0 / std::sqrt(2.0)) : 1.0;
    }
    tablesInitialized = true;
}

void WatermarkEngine::embedSignature(uint32_t* pixels, int width, int height, int stride) {
    initTables();
    if (width < 64 || height < 64) {
        return;
    }

    int offsets[5][2] = {
        { 0, 0 },                                    // Top-Left
        { width - 64, 0 },                           // Top-Right
        { 0, height - 64 },                          // Bottom-Left
        { width - 64, height - 64 },                 // Bottom-Right
        { width / 2 - 32, height / 2 - 32 }          // Center
    };

    for (int r = 0; r < 5; ++r) {
        int offsetX = offsets[r][0];
        int offsetY = offsets[r][1];

        for (int blockIndex = 0; blockIndex < 64; ++blockIndex) {
            int startX = offsetX + (blockIndex % 8) * 8;
            int startY = offsetY + (blockIndex / 8) * 8;
            uint64_t bit = (SIGNATURE >> (63 - blockIndex)) & 1ULL;

            double luma[8][8];
            uint32_t alpha[8][8];

            for (int y = 0; y < 8; ++y) {
                for (int x = 0; x < 8; ++x) {
                    uint32_t color = pixels[(startY + y) * stride + (startX + x)];
                    int r_val = (color >> 16) & 0xFF;
                    int g = (color >> 8) & 0xFF;
                    int b = color & 0xFF;

                    luma[y][x] = 0.299 * r_val + 0.587 * g + 0.114 * b;
                    alpha[y][x] = color & 0xFF000000;
                }
            }

            // Forward DCT
            double dct[8][8];
            for (int u = 0; u < 8; ++u) {
                for (int v = 0; v < 8; ++v) {
                    double sum = 0.0;
                    for (int y = 0; y < 8; ++y) {
                        for (int x = 0; x < 8; ++x) {
                            sum += luma[y][x] * cosTable[x][u] * cosTable[y][v];
                        }
                    }
                    dct[u][v] = 0.25 * cTable[u] * cTable[v] * sum;
                }
            }

            // Modulate mid-frequency coefficients
            int u1 = 3; int v1 = 4;
            int u2 = 4; int v2 = 3;

            if (bit == 1ULL) {
                if (dct[u1][v1] <= dct[u2][v2] + ALPHA) {
                    double avg = (dct[u1][v1] + dct[u2][v2]) / 2.0;
                    dct[u1][v1] = avg + ALPHA / 2.0;
                    dct[u2][v2] = avg - ALPHA / 2.0;
                }
            } else {
                if (dct[u2][v2] <= dct[u1][v1] + ALPHA) {
                    double avg = (dct[u1][v1] + dct[u2][v2]) / 2.0;
                    dct[u2][v2] = avg + ALPHA / 2.0;
                    dct[u1][v1] = avg - ALPHA / 2.0;
                }
            }

            // Inverse DCT
            for (int y = 0; y < 8; ++y) {
                for (int x = 0; x < 8; ++x) {
                    double sum = 0.0;
                    for (int u = 0; u < 8; ++u) {
                        for (int v = 0; v < 8; ++v) {
                            sum += cTable[u] * cTable[v] * dct[u][v] * cosTable[x][u] * cosTable[y][v];
                        }
                    }
                    double newY = 0.25 * sum;
                    if (newY < 0.0) newY = 0.0;
                    if (newY > 255.0) newY = 255.0;

                    uint32_t oldColor = pixels[(startY + y) * stride + (startX + x)];
                    int oldR = (oldColor >> 16) & 0xFF;
                    int oldG = (oldColor >> 8) & 0xFF;
                    int oldB = oldColor & 0xFF;
                    double oldY = 0.299 * oldR + 0.587 * oldG + 0.114 * oldB;

                    double diff = newY - oldY;
                    int newR = std::max(0, std::min(255, static_cast<int>(oldR + diff)));
                    int newG = std::max(0, std::min(255, static_cast<int>(oldG + diff)));
                    int newB = std::max(0, std::min(255, static_cast<int>(oldB + diff)));

                    pixels[(startY + y) * stride + (startX + x)] = alpha[y][x] | (newR << 16) | (newG << 8) | newB;
                }
            }
        }
    }
}

bool WatermarkEngine::verifySignature(const uint32_t* pixels, int width, int height, int stride) {
    initTables();
    if (width < 64 || height < 64) {
        return false;
    }

    int offsets[5][2] = {
        { 0, 0 },                                    // Top-Left
        { width - 64, 0 },                           // Top-Right
        { 0, height - 64 },                          // Bottom-Left
        { width - 64, height - 64 },                 // Bottom-Right
        { width / 2 - 32, height / 2 - 32 }          // Center
    };

    for (int r = 0; r < 5; ++r) {
        int offsetX = offsets[r][0];
        int offsetY = offsets[r][1];

        int matchingBits = 0;
        for (int blockIndex = 0; blockIndex < 64; ++blockIndex) {
            int startX = offsetX + (blockIndex % 8) * 8;
            int startY = offsetY + (blockIndex / 8) * 8;
            uint64_t expectedBit = (SIGNATURE >> (63 - blockIndex)) & 1ULL;

            double luma[8][8];
            for (int y = 0; y < 8; ++y) {
                for (int x = 0; x < 8; ++x) {
                    uint32_t color = pixels[(startY + y) * stride + (startX + x)];
                    int r_val = (color >> 16) & 0xFF;
                    int g = (color >> 8) & 0xFF;
                    int b = color & 0xFF;
                    luma[y][x] = 0.299 * r_val + 0.587 * g + 0.114 * b;
                }
            }

            int u1 = 3; int v1 = 4;
            int u2 = 4; int v2 = 3;

            double sum1 = 0.0; double sum2 = 0.0;
            for (int y = 0; y < 8; ++y) {
                for (int x = 0; x < 8; ++x) {
                    sum1 += luma[y][x] * cosTable[x][u1] * cosTable[y][v1];
                    sum2 += luma[y][x] * cosTable[x][u2] * cosTable[y][v2];
                }
            }

            double dct1 = 0.25 * cTable[u1] * cTable[v1] * sum1;
            double dct2 = 0.25 * cTable[u2] * cTable[v2] * sum2;

            uint64_t actualBit = (dct1 > dct2) ? 1ULL : 0ULL;
            if (actualBit == expectedBit) {
                matchingBits++;
            }
        }

#ifndef NDEBUG
        printf("DEBUG: Region %d matchingBits = %d (threshold = %d)\n", r, matchingBits, MATCH_THRESHOLD);
#endif

        if (matchingBits >= MATCH_THRESHOLD) {
            return true;
        }
    }

    return false;
}
