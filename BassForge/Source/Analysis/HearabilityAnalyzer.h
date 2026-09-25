#pragma once
#include <cmath>
#include <vector>

namespace BassForge::Analysis
{

struct HearabilityMetrics
{
    float fundamentalEnergy; // 20 - 80 Hz
    float bodyEnergy;        // 80 - 250 Hz
    float upperHarmonicEnergy; // 250 - 1600 Hz
    float smallSpeakerScore; // 0 - 100%
    bool isLowEndDependent;
};

class HearabilityAnalyzer
{
public:
    HearabilityAnalyzer() = default;

    void prepare(double sampleRate);
    void reset();

    void pushSample(float sample);
    HearabilityMetrics getMetrics() const;

private:
    double mSampleRate { 48000.0 };
    float mSubEnergyAcc { 0.0f };
    float mBodyEnergyAcc { 0.0f };
    float mUpperEnergyAcc { 0.0f };
    int mSampleCount { 0 };

    // Filters for energy accumulation
    float mSubLp { 0.0f };
    float mBodyLp { 0.0f };
    float mUpperLp { 0.0f };

    HearabilityMetrics mCurrentMetrics { 0.0f, 0.0f, 0.0f, 50.0f, false };
};

} // namespace BassForge::Analysis
