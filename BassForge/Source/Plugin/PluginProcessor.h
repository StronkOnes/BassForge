#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_dsp/juce_dsp.h>
#include "../DSP/SubOscillator.h"
#include "../DSP/HarmonicEngine.h"
#include "../DSP/DistortionEngine.h"
#include "../DSP/FrequencySplitter.h"
#include "../Analysis/HearabilityAnalyzer.h"
#include "../MusicalContext/BassContextEngine.h"
#include "../Presets/PresetManager.h"

namespace BassForge
{

class BassForgeAudioProcessor : public juce::AudioProcessor
{
public:
    BassForgeAudioProcessor();
    ~BassForgeAudioProcessor() override;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported(const BusesLayout& layouts) const override;

    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram(int index) override;
    const juce::String getProgramName(int index) override;
    void changeProgramName(int index, const juce::String& newName) override;

    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    juce::AudioProcessorValueTreeState& getAPVTS() { return mAPVTS; }
    Analysis::HearabilityAnalyzer& getHearabilityAnalyzer() { return mHearabilityAnalyzer; }

    static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

private:
    juce::AudioProcessorValueTreeState mAPVTS;

    DSP::SubOscillator mSubOsc;
    DSP::HarmonicEngine mHarmonicEngine;
    DSP::DistortionEngine mDistortionEngine;
    DSP::FrequencySplitter mFrequencySplitter;
    Analysis::HearabilityAnalyzer mHearabilityAnalyzer;
    Context::BassContextEngine mContextEngine;
    Presets::PresetManager mPresetManager;

    // Active Note State
    int mActiveMidiNote { -1 };
    float mCurrentVelocity { 0.0f };
    double mSampleRate { 48000.0 };

    // Sub Protection Highpass Filter (28 Hz)
    juce::dsp::ProcessorDuplicator<juce::dsp::IIR::Filter<float>, juce::dsp::IIR::Coefficients<float>> mSubProtectFilter;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(BassForgeAudioProcessor)
};

} // namespace BassForge
