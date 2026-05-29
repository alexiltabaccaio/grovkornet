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
                                    float satPurple, float satMagenta,
                                    float boundMagentaRed, float boundRedOrange, float boundOrangeYellow, float boundYellowGreen,
                                    float boundGreenCyan, float boundCyanBlue, float boundBluePurple, float boundPurpleMagenta,
                                    float blackLevel, float highlights, float pivot,
                                    float contrastAuto, float blackLevelAuto, float highlightsAuto, float pivotAuto) {
  std::unique_lock<std::mutex> lock(lutMutex);

  // Check if parameters actually changed
  if (saturation == currentSaturation && contrast == currentContrast &&
      ev == currentEv && whiteBalance == currentWhiteBalance &&
      tint == currentTint && satRed == currentSatRed &&
      satOrange == currentSatOrange && satYellow == currentSatYellow &&
      satGreen == currentSatGreen && satCyan == currentSatCyan &&
      satBlue == currentSatBlue && satPurple == currentSatPurple &&
      satMagenta == currentSatMagenta &&
      boundMagentaRed == currentBoundMagentaRed &&
      boundRedOrange == currentBoundRedOrange &&
      boundOrangeYellow == currentBoundOrangeYellow &&
      boundYellowGreen == currentBoundYellowGreen &&
      boundGreenCyan == currentBoundGreenCyan &&
      boundCyanBlue == currentBoundCyanBlue &&
      boundBluePurple == currentBoundBluePurple &&
      boundPurpleMagenta == currentBoundPurpleMagenta &&
      blackLevel == currentBlackLevel &&
      highlights == currentHighlights &&
      pivot == currentPivot &&
      contrastAuto == currentContrastAuto &&
      blackLevelAuto == currentBlackLevelAuto &&
      highlightsAuto == currentHighlightsAuto &&
      pivotAuto == currentPivotAuto) {
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
  currentBoundMagentaRed = boundMagentaRed;
  currentBoundRedOrange = boundRedOrange;
  currentBoundOrangeYellow = boundOrangeYellow;
  currentBoundYellowGreen = boundYellowGreen;
  currentBoundGreenCyan = boundGreenCyan;
  currentBoundCyanBlue = boundCyanBlue;
  currentBoundBluePurple = boundBluePurple;
  currentBoundPurpleMagenta = boundPurpleMagenta;
  currentBlackLevel = blackLevel;
  currentHighlights = highlights;
  currentPivot = pivot;
  currentContrastAuto = contrastAuto;
  currentBlackLevelAuto = blackLevelAuto;
  currentHighlightsAuto = highlightsAuto;
  currentPivotAuto = pivotAuto;

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
      activeBoundMagentaRed = currentBoundMagentaRed;
      activeBoundRedOrange = currentBoundRedOrange;
      activeBoundOrangeYellow = currentBoundOrangeYellow;
      activeBoundYellowGreen = currentBoundYellowGreen;
      activeBoundGreenCyan = currentBoundGreenCyan;
      activeBoundCyanBlue = currentBoundCyanBlue;
      activeBoundBluePurple = currentBoundBluePurple;
      activeBoundPurpleMagenta = currentBoundPurpleMagenta;
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

namespace {
struct ColorBand {
  float start;
  float end;
  float val;
};

inline float unwrap_angle(float angle, float ref) {
  float val = angle;
  while (val < ref) val += 360.0f;
  while (val >= ref + 360.0f) val -= 360.0f;
  return val;
}

const float INV_2_4 = 1.0f / 2.4f;
inline float linearToSrgb(float c) {
  if (c <= 0.0f)
    return 0.0f;
  if (c >= 1.0f)
    return 1.0f;
  return (c <= 0.0031308f) ? c * 12.92f
                           : 1.055f * std::pow(c, INV_2_4) - 0.055f;
}

inline void rgbToLms(float lin_r, float l_lms_bg, float m_lms_bg, float s_lms_bg,
                     float& l_lms, float& m_lms, float& s_lms) {
  l_lms = 0.4122214708f * lin_r + l_lms_bg;
  m_lms = 0.2119034982f * lin_r + m_lms_bg;
  s_lms = 0.0883024619f * lin_r + s_lms_bg;

  l_lms = std::cbrt(std::max(0.0f, l_lms));
  m_lms = std::cbrt(std::max(0.0f, m_lms));
  s_lms = std::cbrt(std::max(0.0f, s_lms));
}

inline void lmsToOklab(float l_lms, float m_lms, float s_lms, float& oklab_a, float& oklab_b) {
  oklab_a = 1.9779984951f * l_lms - 2.4285922050f * m_lms + 0.4505937099f * s_lms;
  oklab_b = 0.0259040371f * l_lms + 0.7827717662f * m_lms - 0.8086757660f * s_lms;
}

inline float calculateSelectiveSaturationMultiplier(float h, const ColorBand* bands) {
  int activeBand = -1;
  for (int i = 0; i < 8; ++i) {
    bool inside = false;
    if (bands[i].start > bands[i].end) {
      if (h >= bands[i].start || h <= bands[i].end) inside = true;
    } else {
      if (h >= bands[i].start && h <= bands[i].end) inside = true;
    }
    if (inside) {
      activeBand = i;
      break;
    }
  }

  if (activeBand == -1) {
    return 1.0f;
  }

  int prevBand = (activeBand - 1 + 8) % 8;
  int nextBand = (activeBand + 1) % 8;

  float L = bands[activeBand].start;
  float R = bands[activeBand].end;

  float valPrev = bands[prevBand].val;
  float valCurr = bands[activeBand].val;
  float valNext = bands[nextBand].val;

  float widthCurr = R - L;
  if (widthCurr < 0.0f) widthCurr += 360.0f;

  float widthPrev = L - bands[prevBand].start;
  if (widthPrev < 0.0f) widthPrev += 360.0f;

  float widthNext = bands[nextBand].end - R;
  if (widthNext < 0.0f) widthNext += 360.0f;

  const float MAX_RADIUS = 5.0f;
  float radiusL = std::min(MAX_RADIUS, std::min(widthPrev * 0.5f, widthCurr * 0.5f));
  float radiusR = std::min(MAX_RADIUS, std::min(widthCurr * 0.5f, widthNext * 0.5f));

  float h_unwrapped_L = unwrap_angle(h, L - radiusL);
  float dist_L = h_unwrapped_L - (L - radiusL);

  float h_unwrapped_R = unwrap_angle(h, R - radiusR);
  float dist_R = h_unwrapped_R - (R - radiusR);

  if (dist_L >= 0.0f && dist_L < 2.0f * radiusL && radiusL > 0.001f) {
    float t = dist_L / (2.0f * radiusL);
    t = t * t * (3.0f - 2.0f * t); // Smoothstep
    return (1.0f - t) * valPrev + t * valCurr;
  } else if (dist_R >= 0.0f && dist_R < 2.0f * radiusR && radiusR > 0.001f) {
    float t = dist_R / (2.0f * radiusR);
    t = t * t * (3.0f - 2.0f * t); // Smoothstep
    return (1.0f - t) * valCurr + t * valNext;
  } else {
    return valCurr;
  }
}
} // namespace

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
    float boundMagentaRed = 350.0f;
    float boundRedOrange = 45.0f;
    float boundOrangeYellow = 80.0f;
    float boundYellowGreen = 125.0f;
    float boundGreenCyan = 170.0f;
    float boundCyanBlue = 230.0f;
    float boundBluePurple = 280.0f;
    float boundPurpleMagenta = 315.0f;
    float blackLevel = 0.0f;
    float highlights = 1.0f;
    float pivot = 0.5f;
    float contrastAuto = 1.0f;
    float blackLevelAuto = 1.0f;
    float highlightsAuto = 1.0f;
    float pivotAuto = 1.0f;

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
      boundMagentaRed = currentBoundMagentaRed;
      boundRedOrange = currentBoundRedOrange;
      boundOrangeYellow = currentBoundOrangeYellow;
      boundYellowGreen = currentBoundYellowGreen;
      boundGreenCyan = currentBoundGreenCyan;
      boundCyanBlue = currentBoundCyanBlue;
      boundBluePurple = currentBoundBluePurple;
      boundPurpleMagenta = currentBoundPurpleMagenta;
      blackLevel = currentBlackLevel;
      highlights = currentHighlights;
      pivot = currentPivot;
      contrastAuto = currentContrastAuto;
      blackLevelAuto = currentBlackLevelAuto;
      highlightsAuto = currentHighlightsAuto;
      pivotAuto = currentPivotAuto;

      lutParametersDirty = false;
      isComputingLut = true;
    }

    // Resolve auto flags
    if (contrastAuto > 0.5f) {
      contrast = 1.0f;
    }
    if (blackLevelAuto > 0.5f) {
      blackLevel = 0.0f;
    }
    if (highlightsAuto > 0.5f) {
      highlights = 1.0f;
    }
    if (pivotAuto > 0.5f) {
      pivot = 0.5f;
    }

    // Compute EV multiplier and White Balance factors outside the loops
    float evMultiplier = std::pow(2.0f, ev);
    float temp = whiteBalance / 5000.0f;
    float tintOffset = tint / 100.0f;
    float wb_r = temp * (1.0f + tintOffset * 0.2f);
    float wb_g = 1.0f - tintOffset * 0.2f;
    float wb_b = (1.0f / temp) * (1.0f + tintOffset * 0.2f);

    // S-Curve parameters setup
    // Invert parameters so positive slider (+100) = brighter, negative (-100) = darker
    float actualBlackLevel = -blackLevel;
    float actualWhitePoint = 2.0f - highlights;

    float safeP = std::max(0.01f, std::min(0.99f, pivot));
    float denom = actualWhitePoint - actualBlackLevel;
    if (std::abs(denom) < 0.001f) {
      denom = denom >= 0.0f ? 0.001f : -0.001f;
    }

    // Definition of perceptual color bands in OKLAB (Core Plateaus).
    const ColorBand bands[8] = {
        {boundMagentaRed, boundRedOrange, satRed / 50.0f},     // 0: Red
        {boundRedOrange, boundOrangeYellow, satOrange / 50.0f},   // 1: Orange
        {boundOrangeYellow, boundYellowGreen, satYellow / 50.0f},  // 2: Yellow
        {boundYellowGreen, boundGreenCyan, satGreen / 50.0f},  // 3: Green
        {boundGreenCyan, boundCyanBlue, satCyan / 50.0f},   // 4: Cyan
        {boundCyanBlue, boundBluePurple, satBlue / 50.0f},   // 5: Blue
        {boundBluePurple, boundPurpleMagenta, satPurple / 50.0f}, // 6: Purple
        {boundPurpleMagenta, boundMagentaRed, satMagenta / 50.0f} // 7: Magenta
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
            float l_lms, m_lms, s_lms;
            rgbToLms(lin_r, l_lms_bg, m_lms_bg, s_lms_bg, l_lms, m_lms, s_lms);

            float oklab_a, oklab_b;
            lmsToOklab(l_lms, m_lms, s_lms, oklab_a, oklab_b);

            // Calculate perceptual Hue angle
            float h = std::atan2(oklab_b, oklab_a) * 180.0f / M_PI;
            if (h < 0.0f) h += 360.0f;
            if (h >= 360.0f) h -= 360.0f;

            selectiveMult = calculateSelectiveSaturationMultiplier(h, bands);
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

          // 2. Apply EV and White Balance (linear space)
          out_r = out_r * evMultiplier * wb_r;
          out_g = out_g * evMultiplier * wb_g;
          out_b = out_b * evMultiplier * wb_b;

          // 3. Apply Tone Curve (S-Curve with actualBlackLevel, actualWhitePoint, contrast, pivot)
          float x_prime_r = std::max(0.0f, std::min(1.0f, (out_r - actualBlackLevel) / denom));
          if (x_prime_r <= safeP) {
            out_r = safeP * std::pow(x_prime_r / safeP, contrast);
          } else {
            out_r = 1.0f - (1.0f - safeP) * std::pow((1.0f - x_prime_r) / (1.0f - safeP), contrast);
          }

          float x_prime_g = std::max(0.0f, std::min(1.0f, (out_g - actualBlackLevel) / denom));
          if (x_prime_g <= safeP) {
            out_g = safeP * std::pow(x_prime_g / safeP, contrast);
          } else {
            out_g = 1.0f - (1.0f - safeP) * std::pow((1.0f - x_prime_g) / (1.0f - safeP), contrast);
          }

          float x_prime_b = std::max(0.0f, std::min(1.0f, (out_b - actualBlackLevel) / denom));
          if (x_prime_b <= safeP) {
            out_b = safeP * std::pow(x_prime_b / safeP, contrast);
          } else {
            out_b = 1.0f - (1.0f - safeP) * std::pow((1.0f - x_prime_b) / (1.0f - safeP), contrast);
          }

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

