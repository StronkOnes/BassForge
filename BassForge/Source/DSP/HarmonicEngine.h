#pragma once
#include <cmath>
#include <array>

namespace BassForge::DSP
{

class HarmonicEngine
{
public:
    HarmonicEngine() = default;

    void prepare(double sampleRate);
    void reset();

    void setFundamentalFrequency(double freqHz);
    void setHarmonicLevels(float h2, float h3, float h4, float h5, float h7, float h9);
    void setEvenOddBalance(float balance); // -1 (odd) to +1 (even)
    void setSpread(float spread);

    double calculateHarmonicFrequency(double f0, int multiplier) const;

    float processSample();

private:
    double mSampleRate { 48000.0 };
    double mF0 { 55.0 };

    struct HarmonicVoice
    {
        int multiplier;
        bool isEven;
        float baseLevel;
        double phase;
    };

    std::array<HarmonicVoice, 6> mVoices {{
        { 2, true,  0.4f, 0.0 },
        { 3, false, 0.3f, 0.0 },
        { 4, true,  0.15f, 0.0 },
        { 5, false, 0.2f, 0.0 },
        { 7, false, 0.1f, 0.0 },
        { 9, false, 0.05f, 0.0 }
    }};

    float mEvenOddBalance { 0.0f };
    float mSpread { 0.3f };
};

} // namespace BassForge::DSP
