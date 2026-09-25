#include "HearabilityAnalyzer.h"
#include <algorithm>

namespace BassForge::Analysis
{

void HearabilityAnalyzer::prepare(double sampleRate)
{
    mSampleRate = sampleRate > 1000.0 ? sampleRate : 48000.0;
    reset();
}

void HearabilityAnalyzer::reset()
{
    mSubEnergyAcc = 0.0f;
    mBodyEnergyAcc = 0.0f;
    mUpperEnergyAcc = 0.0f;
    mSampleCount = 0;
    mSubLp = 0.0f;
    mBodyLp = 0.0f;
    mUpperLp = 0.0f;
}

void HearabilityAnalyzer::pushSample(float sample)
{
    float aSub = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * 80.0 / mSampleRate));
    float aBody = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * 250.0 / mSampleRate));
    float aUpper = static_cast<float>(1.0 - std::exp(-2.0 * M_PI * 1600.0 / mSampleRate));

    mSubLp += aSub * (sample - mSubLp);
    mBodyLp += aBody * (sample - mBodyLp);
    mUpperLp += aUpper * (sample - mUpperLp);

    float subBand = mSubLp;
    float bodyBand = mBodyLp - mSubLp;
    float upperBand = mUpperLp - mBodyLp;

    mSubEnergyAcc += subBand * subBand;
    mBodyEnergyAcc += bodyBand * bodyBand;
    mUpperEnergyAcc += upperBand * upperBand;
    mSampleCount++;

    // Compute metrics window every 2048 samples (~43ms)
    if (mSampleCount >= 2048)
    {
        float norm = 1.0f / mSampleCount;
        float subRms = std::sqrt(mSubEnergyAcc * norm) * 100.0f;
        float bodyRms = std::sqrt(mBodyEnergyAcc * norm) * 100.0f;
        float upperRms = std::sqrt(mUpperEnergyAcc * norm) * 100.0f;

        float speakerScore = std::min(100.0f, bodyRms * 0.6f + upperRms * 0.8f);
        bool isLowEndDep = (subRms > 15.0f && bodyRms < 6.0f && upperRms < 4.0f);

        mCurrentMetrics.fundamentalEnergy = subRms;
        mCurrentMetrics.bodyEnergy = bodyRms;
        mCurrentMetrics.upperHarmonicEnergy = upperRms;
        mCurrentMetrics.smallSpeakerScore = speakerScore;
        mCurrentMetrics.isLowEndDependent = isLowEndDep;

        mSubEnergyAcc = 0.0f;
        mBodyEnergyAcc = 0.0f;
        mUpperEnergyAcc = 0.0f;
        mSampleCount = 0;
    }
}

HearabilityMetrics HearabilityAnalyzer::getMetrics() const
{
    return mCurrentMetrics;
}

} // namespace BassForge::Analysis
