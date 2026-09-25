#pragma once
#include <juce_gui_basics/juce_gui_basics.h>
#include <juce_audio_processors/juce_audio_processors.h>
#include "PluginProcessor.h"

namespace BassForge
{

class BassForgeAudioProcessorEditor : public juce::AudioProcessorEditor,
                                     private juce::Timer
{
public:
    explicit BassForgeAudioProcessorEditor(BassForgeAudioProcessor&);
    ~BassForgeAudioProcessorEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;

    BassForgeAudioProcessor& mProcessor;

    juce::Slider mSubLevelSlider;
    juce::Slider mDistDriveSlider;
    juce::Slider mHarmonic2Slider;
    juce::Slider mHarmonic3Slider;
    juce::Slider mHearabilitySlider;

    juce::ComboBox mDistTypeBox;
    juce::ToggleButton mSubProtectButton { "Sub Protect (28Hz)" };

    using SliderAttachment = juce::AudioProcessorValueTreeState::SliderAttachment;
    using ComboBoxAttachment = juce::AudioProcessorValueTreeState::ComboBoxAttachment;
    using ButtonAttachment = juce::AudioProcessorValueTreeState::ButtonAttachment;

    std::unique_ptr<SliderAttachment> mSubLevelAttach;
    std::unique_ptr<SliderAttachment> mDistDriveAttach;
    std::unique_ptr<SliderAttachment> mHarmonic2Attach;
    std::unique_ptr<SliderAttachment> mHarmonic3Attach;
    std::unique_ptr<SliderAttachment> mHearabilityAttach;
    std::unique_ptr<ComboBoxAttachment> mDistTypeAttach;
    std::unique_ptr<ButtonAttachment> mSubProtectAttach;

    Analysis::HearabilityMetrics mCurrentMetrics {};

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(BassForgeAudioProcessorEditor)
};

} // namespace BassForge
