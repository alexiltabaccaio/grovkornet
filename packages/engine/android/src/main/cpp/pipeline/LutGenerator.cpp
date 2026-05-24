#include "LutGenerator.h"
#include <algorithm>
#include <cmath>


LutGenerator::LutGenerator() {
  lutBuffer.resize(LUT_SIZE * LUT_SIZE * LUT_SIZE * 4, 0);
  // Initialize with Identity LUT so it's instantly usable
  int index = 0;
  for (int b = 0; b < LUT_SIZE; ++b) {
    float b_val = (float)b / (LUT_SIZE - 1);
    for (int g = 0; g < LUT_SIZE; ++g) {
      float g_val = (float)g / (LUT_SIZE - 1);
      for (int r = 0; r < LUT_SIZE; ++r) {
        float r_val = (float)r / (LUT_SIZE - 1);
        lutBuffer[index++] = static_cast<uint8_t>(r_val * 255.0f + 0.5f);
        lutBuffer[index++] = static_cast<uint8_t>(g_val * 255.0f + 0.5f);
        lutBuffer[index++] = static_cast<uint8_t>(b_val * 255.0f + 0.5f);
        lutBuffer[index++] = 255;
      }
    }
  }
  lutDataReady = true; // Mark as ready immediately
  lutParametersDirty = true;
}

LutGenerator::~LutGenerator() { stop(); }

void LutGenerator::start() {
  std::unique_lock<std::mutex> lock(lutMutex);
  if (!lutThreadRunning) {
    lutThreadRunning = true;
    lutParametersDirty = true;
    lutThread = std::thread(&LutGenerator::lutGenerationLoop, this);
  }
}

void LutGenerator::stop() {
  {
    std::unique_lock<std::mutex> lock(lutMutex);
    if (!lutThreadRunning)
      return;
    lutThreadRunning = false;
    lutCv.notify_all();
  }
  if (lutThread.joinable()) {
    lutThread.join();
  }
}

void LutGenerator::triggerLutUpdate(float saturation, float contrast, float ev,
                                    float whiteBalance, float tint,
                                    float satRed, float satOrange,
                                    float satYellow, float satGreen,
                                    float satCyan, float satBlue,
                                    float satPurple, float satMagenta) {
  std::unique_lock<std::mutex> lock(lutMutex);

  // Check if parameters actually changed
  if (saturation == currentSaturation && contrast == currentContrast &&
      ev == currentEv && whiteBalance == currentWhiteBalance &&
      tint == currentTint && satRed == currentSatRed &&
      satOrange == currentSatOrange && satYellow == currentSatYellow &&
      satGreen == currentSatGreen && satCyan == currentSatCyan &&
      satBlue == currentSatBlue && satPurple == currentSatPurple &&
      satMagenta == currentSatMagenta) {
    return;
  }

  currentSaturation = saturation;
  currentContrast = contrast;
  currentEv = ev;
  currentWhiteBalance = whiteBalance;
  currentTint = tint;
  currentSatRed = satRed;
  currentSatOrange = satOrange;
  currentSatYellow = satYellow;
  currentSatGreen = satGreen;
  currentSatCyan = satCyan;
  currentSatBlue = satBlue;
  currentSatPurple = satPurple;
  currentSatMagenta = satMagenta;

  lutParametersDirty = true;
  lutCv.notify_one();
}

void LutGenerator::applyLutTextureUpdate(filament::Engine &engine,
                                         filament::Texture *lutTexture) {
  std::vector<uint8_t> localLut;
  bool updateNeeded = false;

  {
    std::unique_lock<std::mutex> lock(lutMutex);
    // We no longer wait. If it's not ready, we just skip updating this frame.
    // Because we initialized with Identity LUT, there is always at least one
    // valid LUT ready at startup.

    if (lutDataReady) {
      localLut = lutBuffer;
      lutDataReady = false;
      updateNeeded = true;

      // Update active parameters cache
      activeSaturation = currentSaturation;
      activeContrast = currentContrast;
      activeEv = currentEv;
      activeWhiteBalance = currentWhiteBalance;
      activeTint = currentTint;
      activeSatRed = currentSatRed;
      activeSatOrange = currentSatOrange;
      activeSatYellow = currentSatYellow;
      activeSatGreen = currentSatGreen;
      activeSatCyan = currentSatCyan;
      activeSatBlue = currentSatBlue;
      activeSatPurple = currentSatPurple;
      activeSatMagenta = currentSatMagenta;
    }
  }

  if (updateNeeded && lutTexture) {
    // Allocate buffer on heap to survive asynchronous upload
    auto *bufferCopy = new std::vector<uint8_t>(std::move(localLut));
    // Upload the new LUT to the 3D texture with explicit dimensions (width,
    // height, depth)
    lutTexture->setImage(engine, 0, 0, 0, 0, LUT_SIZE, LUT_SIZE, LUT_SIZE,
                         filament::Texture::PixelBufferDescriptor(
                             bufferCopy->data(), bufferCopy->size(),
                             filament::backend::PixelDataFormat::RGBA,
                             filament::backend::PixelDataType::UBYTE,
                             [](void *buffer, size_t size, void *user) {
                               delete static_cast<std::vector<uint8_t> *>(user);
                             },
                             bufferCopy));
  }
}

void LutGenerator::waitForLut() {
  std::unique_lock<std::mutex> lock(lutMutex);
  lutCv.wait(lock, [this]() {
    return !lutThreadRunning || (!lutParametersDirty && !isComputingLut);
  });
}

void LutGenerator::lutGenerationLoop() {
  std::vector<uint8_t> tempBuffer(LUT_SIZE * LUT_SIZE * LUT_SIZE * 4);

  // Precompute sRGB-to-Linear lookup table for input coordinates
  float linearTable[LUT_SIZE];
  for (int i = 0; i < LUT_SIZE; ++i) {
    float val = (float)i / (LUT_SIZE - 1);
    linearTable[i] = (val <= 0.04045f)
                         ? val / 12.92f
                         : std::pow((val + 0.055f) / 1.055f, 2.4f);
  }

  // Linear equivalent of sRGB 0.5 (used as contrast midpoint)
  const float CONTRAST_MIDPOINT = std::pow((0.5f + 0.055f) / 1.055f, 2.4f);

  while (true) {
    float saturation = 1.0f;
    float contrast = 1.0f;
    float ev = 0.0f;
    float whiteBalance = 5000.0f;
    float tint = 0.0f;
    float satRed = 50.0f;
    float satOrange = 50.0f;
    float satYellow = 50.0f;
    float satGreen = 50.0f;
    float satCyan = 50.0f;
    float satBlue = 50.0f;
    float satPurple = 50.0f;
    float satMagenta = 50.0f;

    {
      std::unique_lock<std::mutex> lock(lutMutex);
      lutCv.wait(lock,
                 [this]() { return !lutThreadRunning || lutParametersDirty; });

      if (!lutThreadRunning) {
        break;
      }

      saturation = currentSaturation;
      contrast = currentContrast;
      ev = currentEv;
      whiteBalance = currentWhiteBalance;
      tint = currentTint;
      satRed = currentSatRed;
      satOrange = currentSatOrange;
      satYellow = currentSatYellow;
      satGreen = currentSatGreen;
      satCyan = currentSatCyan;
      satBlue = currentSatBlue;
      satPurple = currentSatPurple;
      satMagenta = currentSatMagenta;

      lutParametersDirty = false;
      isComputingLut = true;
    }

    // Compute EV multiplier and White Balance factors outside the loops
    float evMultiplier = std::pow(2.0f, ev);
    float temp = whiteBalance / 5000.0f;
    float tintOffset = tint / 100.0f;
    float wb_r = temp * (1.0f + tintOffset * 0.2f);
    float wb_g = 1.0f - tintOffset * 0.2f;
    float wb_b = (1.0f / temp) * (1.0f + tintOffset * 0.2f);

    // Precompute combined multipliers and offsets for Contrast, EV, and WB
    float activeContrast = std::max(contrast, 0.0f);
    float contrastOffset = CONTRAST_MIDPOINT * (1.0f - activeContrast);
    
    float finalMult_r = activeContrast * evMultiplier * wb_r;
    float finalMult_g = activeContrast * evMultiplier * wb_g;
    float finalMult_b = activeContrast * evMultiplier * wb_b;
    
    float finalAdd_r = contrastOffset * evMultiplier * wb_r;
    float finalAdd_g = contrastOffset * evMultiplier * wb_g;
    float finalAdd_b = contrastOffset * evMultiplier * wb_b;

    // Definizione delle bande percettive in OKLAB (Core Plateaus).
    struct ColorBand {
      float start;
      float end;
      float val;
    };
    // Pre-divide by 50.0f here to save divisions in the inner loop
    const ColorBand bands[8] = {
        {355.0f, 30.0f, satRed / 50.0f},     // 0: Red (wrappa a 360/0 in OKLAB)
        {38.0f, 72.0f, satOrange / 50.0f},   // 1: Orange
        {80.0f, 110.0f, satYellow / 50.0f},  // 2: Yellow
        {120.0f, 198.0f, satGreen / 50.0f},  // 3: Green
        {208.0f, 225.0f, satCyan / 50.0f},   // 4: Cyan
        {233.0f, 277.0f, satBlue / 50.0f},   // 5: Blue
        {283.0f, 307.0f, satPurple / 50.0f}, // 6: Purple
        {313.0f, 347.0f, satMagenta / 50.0f} // 7: Magenta
    };

    // Helper lambda to convert linear value back to sRGB
    const float INV_2_4 = 1.0f / 2.4f;
    auto linearToSrgb = [INV_2_4](float c) -> float {
      if (c <= 0.0f)
        return 0.0f;
      if (c >= 1.0f)
        return 1.0f;
      return (c <= 0.0031308f) ? c * 12.92f
                               : 1.055f * std::pow(c, INV_2_4) - 0.055f;
    };

    // Compute LUT on CPU
    int index = 0;
    for (int b = 0; b < LUT_SIZE; ++b) {
      float b_val = (float)b / (LUT_SIZE - 1);
      float lin_b = linearTable[b];
      
      // Hoist b-dependent parts of luminance and LMS conversion
      float lum_b = lin_b * 0.0722f;
      float l_lms_b = 0.0514459929f * lin_b;
      float m_lms_b = 0.1073969566f * lin_b;
      float s_lms_b = 0.6299787005f * lin_b;

      for (int g = 0; g < LUT_SIZE; ++g) {
        float g_val = (float)g / (LUT_SIZE - 1);
        float lin_g = linearTable[g];
        
        // Hoist g-dependent parts of luminance and LMS conversion
        float lum_bg = lum_b + lin_g * 0.7152f;
        float l_lms_bg = l_lms_b + 0.5363325363f * lin_g;
        float m_lms_bg = m_lms_b + 0.6806995451f * lin_g;
        float s_lms_bg = s_lms_b + 0.2817188376f * lin_g;

        for (int r = 0; r < LUT_SIZE; ++r) {
          float r_val = (float)r / (LUT_SIZE - 1);
          float lin_r = linearTable[r];

          // 0. Selective Saturation (computed using OKLAB color space for
          // perceptual stability)
          float cmax = std::max(r_val, std::max(g_val, b_val));
          float cmin = std::min(r_val, std::min(g_val, b_val));
          float delta = cmax - cmin;

          float selectiveMult = 1.0f;
          if (delta > 1e-6f) {
            // Convert linear RGB to LMS
            float l_lms = 0.4122214708f * lin_r + l_lms_bg;
            float m_lms = 0.2119034982f * lin_r + m_lms_bg;
            float s_lms = 0.0883024619f * lin_r + s_lms_bg;

            // Non-linear response (cube root)
            l_lms = std::cbrt(std::max(0.0f, l_lms));
            m_lms = std::cbrt(std::max(0.0f, m_lms));
            s_lms = std::cbrt(std::max(0.0f, s_lms));

            // LMS to OKLAB chrominance components a and b
            float oklab_a = 1.9779984951f * l_lms - 2.4285922050f * m_lms +
                            0.4505937099f * s_lms;
            float oklab_b = 0.0259040371f * l_lms + 0.7827717662f * m_lms -
                            0.8086757660f * s_lms;

            // Calculate perceptual Hue angle
            float h = std::atan2(oklab_b, oklab_a) * 180.0f / M_PI;
            if (h < 0.0f)
              h += 360.0f;
            if (h >= 360.0f)
              h -= 360.0f;

            // Gestione speciale per il Rosso che wrappa a 360/0
            if (h >= bands[0].start || h <= bands[0].end) {
              selectiveMult = bands[0].val;
            } else {
              bool handled = false;
              for (int i = 0; i < 7; ++i) {
                // Controllo se il colore è dentro il plateau puro
                if (h >= bands[i + 1].start && h <= bands[i + 1].end) {
                  selectiveMult = bands[i + 1].val;
                  handled = true;
                  break;
                }
                // Controllo se è nel gap di transizione tra due plateau
                if (h > bands[i].end && h < bands[i + 1].start) {
                  float gapStart = bands[i].end;
                  float gapEnd = bands[i + 1].start;
                  float t = (h - gapStart) / (gapEnd - gapStart);
                  t = t * t * (3.0f - 2.0f * t); // Smoothstep
                  selectiveMult = (1.0f - t) * bands[i].val +
                                  t * bands[i + 1].val;
                  handled = true;
                  break;
                }
              }

              // Se non è stato gestito, è nel gap tra Magenta (7) e Red (0)
              if (!handled && h > bands[7].end && h < bands[0].start) {
                float gapStart = bands[7].end;
                float gapEnd = bands[0].start;
                float t = (h - gapStart) / (gapEnd - gapStart);
                t = t * t * (3.0f - 2.0f * t);
                selectiveMult = (1.0f - t) * bands[7].val +
                                t * bands[0].val;
              }
            }
          }

          // 1. Saturation (applied in linear space)
          float effectiveSaturation = saturation * selectiveMult;
          float lin_luminance = lin_r * 0.2126f + lum_bg;
          
          float out_r =
              lin_luminance + (lin_r - lin_luminance) * effectiveSaturation;
          float out_g =
              lin_luminance + (lin_g - lin_luminance) * effectiveSaturation;
          float out_b =
              lin_luminance + (lin_b - lin_luminance) * effectiveSaturation;

          // 2. Apply precomputed Contrast, EV, and White Balance (linear space)
          out_r = out_r * finalMult_r + finalAdd_r;
          out_g = out_g * finalMult_g + finalAdd_g;
          out_b = out_b * finalMult_b + finalAdd_b;

          // Convert back to sRGB and write to buffer (linearToSrgb clamps to
          // [0.0, 1.0])
          tempBuffer[index++] =
              static_cast<uint8_t>(linearToSrgb(out_r) * 255.0f + 0.5f);
          tempBuffer[index++] =
              static_cast<uint8_t>(linearToSrgb(out_g) * 255.0f + 0.5f);
          tempBuffer[index++] =
              static_cast<uint8_t>(linearToSrgb(out_b) * 255.0f + 0.5f);
          tempBuffer[index++] = 255; // Alpha channel
        }
      }
    }

    {
      std::unique_lock<std::mutex> lock(lutMutex);
      lutBuffer = tempBuffer;
      lutDataReady = true;
      isComputingLut = false;
      lutCv.notify_all(); // Wake up any waiting render thread
    }
  }
}
