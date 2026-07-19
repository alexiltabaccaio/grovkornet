#ifndef WATERMARK_ENGINE_H
#define WATERMARK_ENGINE_H

#include <cstdint>

class WatermarkEngine {
public:
    static constexpr uint64_t SIGNATURE = 0x47524F564B4F524EULL; // "GROVKORN"
    static constexpr double ALPHA = 12.0;
    static constexpr int MATCH_THRESHOLD = 48;

    static void initTables();

    // Embeds the 64-bit watermark into 5 distinct 64x64 regions of the pixels (in ARGB_8888 or RGBA_8888 format)
    static void embedSignature(uint32_t* pixels, int width, int height, int stride);

    // Verifies if the pixels have the signature embedded (uses EXIF software tag check as fast path in Kotlin, DCT deep pass here)
    static bool verifySignature(const uint32_t* pixels, int width, int height, int stride);

private:
    static double cosTable[8][8];
    static double cTable[8];
    static bool tablesInitialized;
};

#endif // WATERMARK_ENGINE_H
