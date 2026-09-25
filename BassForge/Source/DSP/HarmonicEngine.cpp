#include "HarmonicEngine.h"
#include <algorithm>

namespace BassForge::DSP
{

constexpr double TWO_PI = 6.28318530717958647692;

void HarmonicEngine::prepare(double sampleRate)
{
    mSampleRate = sampleRate > 1000.0 ? sampleRate : 48000.0;
    reset();
}

void HarmonicEngine::reset()
{
    for (auto& v : mVoices)
    {
        v.phase = 0.0;
    }
}

void HarmonicEngine::setFundamentalFrequency(double freqHz)
{
    mF0 = std::max(10.0, freqHz);
}

double HarmonicEngine::calculateHarmonicFrequency(double f0, int multiplier) const
{
    return f0 * static_cast<double>(multiplier);
}

void HarmonicEngine::setHarmonicLevels(float h2, float h3, float h4, float h5, float h7, float h9)
{
    mVoices[0].baseLevel = std::max(0.0f, h2);
    mVoices[1].baseLevel = std::max(0.0f, h3);
    mVoices[2].baseLevel = std::max(0.0f, h4);
    mVoices[3].baseLevel = std::max(0.0f, h5);
    mVoices[4].baseLevel = std::max(0.0f, h7);
    mVoices[5].baseLevel = std::max(0.0f, h9);
}

void HarmonicEngine::setEvenOddBalance(float balance)
{
    mEvenOddBalance = std::max(-1.0f, std::min(1.0f, balance));
}

void HarmonicEngine::setSpread(float spread)
{
    mSpread = std::max(0.0f, std::min(1.0f, spread));
}

float HarmonicEngine::processSample()
{
    float output = 0.0f;

    for (auto& v : mVoices)
    {
        if (v.baseLevel <= 0.001f)
            continue;

        double harmonicFreq = mF0 * v.multiplier;
        if (harmonicFreq > mSampleRate * 0.48) // Nyquist protection
            continue;

        // Apply Even/Odd weighting
        float weighting = 1.0f;
        if (v.isEven && mEvenOddBalance < 0.0f)
            weighting = 1.0f + mEvenOddBalance;
        else if (!v.isEven && mEvenOddBalance > 0.0f)
            weighting = 1.0f - mEvenOddBalance;

        float effectiveAmp = v.baseLevel * weighting;
        output += static_cast<float>(std::sin(v.phase)) * effectiveAmp;

        // Increment phase
        double inc = (harmonicFreq * TWO_PI) / mSampleRate;
        v.phase += inc;
        if (v.phase >= TWO_PI)
            v.phase -= TWO_PI;
    }

    return output * 0.35f;
}

} // namespace BassForge::DSP
