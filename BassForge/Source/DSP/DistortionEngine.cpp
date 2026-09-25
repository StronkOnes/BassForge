#include "DistortionEngine.h"

namespace BassForge::DSP
{

void DistortionEngine::prepare(double sampleRate)
{
    mSampleRate = sampleRate > 1000.0 ? sampleRate : 48000.0;
    reset();
}

void DistortionEngine::reset()
{
    mToneState = 0.0f;
}

void DistortionEngine::setType(DistortionType type)
{
    mType = type;
}

void DistortionEngine::setDrive(float drive)
{
    mDrive = std::max(0.0f, std::min(1.0f, drive));
}

void DistortionEngine::setBias(float bias)
{
    mBias = std::max(-1.0f, std::min(1.0f, bias));
}

void DistortionEngine::setTone(float tone)
{
    mTone = std::max(0.05f, std::min(1.0f, tone));
}

void DistortionEngine::setMix(float mix)
{
    mMix = std::max(0.0f, std::min(1.0f, mix));
}

float DistortionEngine::processSample(float input)
{
    if (mMix <= 0.001f)
        return input;

    // Apply pre-gain and bias
    float preGain = 1.0f + mDrive * 6.0f;
    float x = input * preGain + mBias * 0.25f;
    float wet = 0.0f;

    switch (mType)
    {
        case DistortionType::SoftClip:
            wet = std::tanh(x);
            break;

        case DistortionType::HardClip:
            wet = std::max(-1.0f, std::min(1.0f, x));
            break;

        case DistortionType::Tube:
        {
            // Asymmetric saturation emphasizing 2nd harmonic
            if (x > 0.0f)
                wet = 1.0f - std::exp(-x);
            else
                wet = -1.0f + std::exp(x);
            wet = wet * 0.85f + 0.15f * (x * x - 0.2f);
            break;
        }

        case DistortionType::Tape:
        {
            // Gentle compression + odd harmonics
            wet = (1.5f * x) / (1.0f + std::abs(x));
            break;
        }

        case DistortionType::Diode:
        {
            if (x > 0.2f)
                wet = std::min(1.0f, (x - 0.2f) * 1.5f);
            else
                wet = std::max(-0.5f, x * 0.6f);
            break;
        }

        case DistortionType::Transistor:
        {
            wet = x > 0.7f ? 1.0f : (x < -0.7f ? -1.0f : x * 1.4f);
            break;
        }

        case DistortionType::Wavefold:
        {
            wet = std::sin(x * 2.5f);
            break;
        }

        case DistortionType::BitReduction:
        {
            float steps = std::max(4.0f, 32.0f * (1.0f - mDrive * 0.8f));
            wet = std::round(x * steps) / steps;
            break;
        }
    }

    // Post tone filter (1-pole lowpass)
    float cutoffHz = 400.0f + mTone * 8000.0f;
    float alpha = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * cutoffHz / mSampleRate));
    mToneState += alpha * (wet - mToneState);
    wet = mToneState;

    // Auto gain compensation to prevent loudness jump
    float normComp = 1.0f / (1.0f + mDrive * 1.2f);
    wet *= normComp;

    // Wet / dry mix
    return input * (1.0f - mMix) + wet * mMix;
}

} // namespace BassForge::DSP
