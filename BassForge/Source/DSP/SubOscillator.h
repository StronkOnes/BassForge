#pragma once
#include <cmath>

namespace BassForge::DSP
{

enum class SubWaveform
{
    Sine = 0,
    Triangle,
    Square
};

class SubOscillator
{
public:
    SubOscillator() = default;

    void prepare(double sampleRate);
    void reset();

    void setFrequency(double freqHz);
    void setTargetFrequency(double freqHz, double glideSec);
    void setWaveform(SubWaveform wave);
    void setLevel(float lvl);
    void setOctave(int oct);

    float processSample();

private:
    double mSampleRate { 48000.0 };
    double mCurrentFreq { 55.0 };
    double mTargetFreq { 55.0 };
    double mGlideCoeff { 1.0 };
    double mPhase { 0.0 };
    double mPhaseIncrement { 0.0 };
    SubWaveform mWaveform { SubWaveform::Sine };
    float mLevel { 0.85f };
    int mOctave { -1 };

    void updatePhaseIncrement();
};

} // namespace BassForge::DSP
