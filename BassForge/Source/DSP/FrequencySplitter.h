#pragma once
#include <cmath>
#include <array>

namespace BassForge::DSP
{

class FrequencySplitter
{
public:
    FrequencySplitter() = default;

    void prepare(double sampleRate);
    void reset();

    void setCrossovers(float subCutoffHz, float bodyCutoffHz, float charCutoffHz);

    struct Bands
    {
        float sub;
        float body;
        float character;
        float harmonics;
    };

    Bands processSample(float input);

private:
    double mSampleRate { 48000.0 };
    float mFSub { 80.0f };
    float mFBody { 180.0f };
    float mFChar { 600.0f };

    // Cascaded 1-pole states for simple linear split
    float mSubLp { 0.0f };
    float mBodyLp { 0.0f };
    float mCharLp { 0.0f };
};

} // namespace BassForge::DSP
