#pragma once
#include <cmath>
#include <algorithm>

namespace BassForge::DSP
{

enum class DistortionType
{
    SoftClip = 0,
    HardClip,
    Tube,
    Tape,
    Diode,
    Transistor,
    Wavefold,
    BitReduction
};

class DistortionEngine
{
public:
    DistortionEngine() = default;

    void prepare(double sampleRate);
    void reset();

    void setType(DistortionType type);
    void setDrive(float drive);
    void setBias(float bias);
    void setTone(float tone);
    void setMix(float mix);

    float processSample(float input);

private:
    double mSampleRate { 48000.0 };
    DistortionType mType { DistortionType::Tube };
    float mDrive { 0.35f };
    float mBias { 0.0f };
    float mTone { 0.6f };
    float mMix { 0.45f };

    // 1-pole post tone lowpass filter
    float mToneState { 0.0f };
};

} // namespace BassForge::DSP
