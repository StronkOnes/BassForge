#include "FrequencySplitter.h"

namespace BassForge::DSP
{

void FrequencySplitter::prepare(double sampleRate)
{
    mSampleRate = sampleRate > 1000.0 ? sampleRate : 48000.0;
    reset();
}

void FrequencySplitter::reset()
{
    mSubLp = 0.0f;
    mBodyLp = 0.0f;
    mCharLp = 0.0f;
}

void FrequencySplitter::setCrossovers(float subCutoffHz, float bodyCutoffHz, float charCutoffHz)
{
    mFSub = std::max(20.0f, subCutoffHz);
    mFBody = std::max(mFSub + 10.0f, bodyCutoffHz);
    mFChar = std::max(mFBody + 10.0f, charCutoffHz);
}

FrequencySplitter::Bands FrequencySplitter::processSample(float input)
{
    float aSub = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * mFSub / mSampleRate));
    float aBody = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * mFBody / mSampleRate));
    float aChar = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * mFChar / mSampleRate));

    mSubLp += aSub * (input - mSubLp);
    mBodyLp += aBody * (input - mBodyLp);
    mCharLp += aChar * (input - mCharLp);

    Bands b;
    b.sub = mSubLp;
    b.body = mBodyLp - mSubLp;
    b.character = mCharLp - mBodyLp;
    b.harmonics = input - mCharLp;

    return b;
}

} // namespace BassForge::DSP
