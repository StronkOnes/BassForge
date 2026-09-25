#include "SubOscillator.h"

namespace BassForge::DSP
{

constexpr double TWO_PI = 6.28318530717958647692;

void SubOscillator::prepare(double sampleRate)
{
    mSampleRate = sampleRate > 1000.0 ? sampleRate : 48000.0;
    reset();
}

void SubOscillator::reset()
{
    mPhase = 0.0;
    mCurrentFreq = mTargetFreq;
    updatePhaseIncrement();
}

void SubOscillator::setFrequency(double freqHz)
{
    mTargetFreq = freqHz;
    mCurrentFreq = freqHz;
    updatePhaseIncrement();
}

void SubOscillator::setTargetFrequency(double freqHz, double glideSec)
{
    mTargetFreq = freqHz;
    if (glideSec <= 0.001)
    {
        mCurrentFreq = freqHz;
        mGlideCoeff = 1.0;
    }
    else
    {
        // 1-pole smoother coefficient
        mGlideCoeff = 1.0 - std::exp(-1.0 / (glideSec * mSampleRate));
    }
}

void SubOscillator::setWaveform(SubWaveform wave)
{
    mWaveform = wave;
}

void SubOscillator::setLevel(float lvl)
{
    mLevel = std::max(0.0f, std::min(1.0f, lvl));
}

void SubOscillator::setOctave(int oct)
{
    mOctave = std::max(-2, std::min(0, oct));
    updatePhaseIncrement();
}

void SubOscillator::updatePhaseIncrement()
{
    double effectiveFreq = mCurrentFreq * std::pow(2.0, mOctave);
    mPhaseIncrement = (effectiveFreq * TWO_PI) / mSampleRate;
}

float SubOscillator::processSample()
{
    // Frequency smoothing
    if (std::abs(mCurrentFreq - mTargetFreq) > 0.001)
    {
        mCurrentFreq += (mTargetFreq - mCurrentFreq) * mGlideCoeff;
        updatePhaseIncrement();
    }

    float sample = 0.0f;
    switch (mWaveform)
    {
        case SubWaveform::Sine:
            sample = static_cast<float>(std::sin(mPhase));
            break;

        case SubWaveform::Triangle:
        {
            // Normalized triangle from phase [0, 2pi]
            double norm = mPhase / TWO_PI;
            sample = static_cast<float>(2.0 * std::abs(2.0 * (norm - std::floor(norm + 0.5))) - 1.0);
            break;
        }

        case SubWaveform::Square:
        {
            sample = mPhase < M_PI ? 1.0f : -1.0f;
            break;
        }
    }

    // Accumulate phase
    mPhase += mPhaseIncrement;
    if (mPhase >= TWO_PI)
        mPhase -= TWO_PI;

    return sample * mLevel;
}

} // namespace BassForge::DSP
