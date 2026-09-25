#include "PluginEditor.h"

namespace BassForge
{

BassForgeAudioProcessorEditor::BassForgeAudioProcessorEditor(BassForgeAudioProcessor& p)
    : AudioProcessorEditor(&p), mProcessor(p)
{
    setSize(780, 520);

    auto& apvts = mProcessor.getAPVTS();

    // Style helper for rotary sliders
    auto setupSlider = [this](juce::Slider& slider, const juce::String& text) {
        slider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
        slider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 55, 18);
        slider.setColour(juce::Slider::rotarySliderFillColourId, juce::Colour(0xff06b6d4)); // Cyan
        slider.setColour(juce::Slider::thumbColourId, juce::Colour(0xff38bdf8));
        addAndMakeVisible(slider);
    };

    setupSlider(mSubLevelSlider, "Sub Level");
    mSubLevelAttach = std::make_unique<SliderAttachment>(apvts, "sub_level", mSubLevelSlider);

    setupSlider(mDistDriveSlider, "Drive");
    mDistDriveAttach = std::make_unique<SliderAttachment>(apvts, "dist_drive", mDistDriveSlider);

    setupSlider(mHarmonic2Slider, "2nd Harm");
    mHarmonic2Attach = std::make_unique<SliderAttachment>(apvts, "harmonic_2", mHarmonic2Slider);

    setupSlider(mHarmonic3Slider, "3rd Harm");
    mHarmonic3Attach = std::make_unique<SliderAttachment>(apvts, "harmonic_3", mHarmonic3Slider);

    setupSlider(mHearabilitySlider, "Hearability");
    mHearabilityAttach = std::make_unique<SliderAttachment>(apvts, "macro_hearability", mHearabilitySlider);

    // Distortion Type ComboBox
    mDistTypeBox.addItemList(juce::StringArray { "Soft Clip", "Hard Clip", "Tube", "Tape", "Diode", "Transistor", "Wavefold", "Bit Reduction" }, 1);
    addAndMakeVisible(mDistTypeBox);
    mDistTypeAttach = std::make_unique<ComboBoxAttachment>(apvts, "dist_type", mDistTypeBox);

    // Sub Protect Toggle
    mSubProtectButton.setColour(juce::ToggleButton::textColourId, juce::Colour(0xff06b6d4));
    addAndMakeVisible(mSubProtectButton);
    mSubProtectAttach = std::make_unique<ButtonAttachment>(apvts, "sub_protect", mSubProtectButton);

    startTimerHz(25);
}

BassForgeAudioProcessorEditor::~BassForgeAudioProcessorEditor()
{
    stopTimer();
}

void BassForgeAudioProcessorEditor::timerCallback()
{
    mCurrentMetrics = mProcessor.getHearabilityAnalyzer().getMetrics();
    repaint();
}

void BassForgeAudioProcessorEditor::paint(juce::Graphics& g)
{
    // Dark Charcoal / Slate Laboratory Background
    g.fillAll(juce::Colour(0xff080a0f));

    // Top Brand Bar
    g.setColour(juce::Colour(0xff0d1017));
    g.fillRect(0, 0, getWidth(), 45);

    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(16.0f, juce::Font::bold));
    g.drawText("BASSFORGE", 16, 12, 160, 20, juce::Justification::left);

    g.setColour(juce::Colour(0xff06b6d4));
    g.setFont(juce::Font(11.0f, juce::Font::plain));
    g.drawText("INTELLIGENT BASS GENERATOR & PREPROCESSOR", 150, 14, 340, 20, juce::Justification::left);

    // Hearability Metric Display Box
    auto metricBox = juce::Rectangle<int>(getWidth() - 220, 8, 204, 30);
    g.setColour(juce::Colour(0xff121622));
    g.fillRoundedRectangle(metricBox.toFloat(), 4.0f);
    g.setColour(juce::Colour(0xff222938));
    g.drawRoundedRectangle(metricBox.toFloat(), 4.0f, 1.0f);

    g.setColour(juce::Colour(0xff94a3b8));
    g.setFont(10.0f);
    g.drawText("Small-Speaker Presence:", metricBox.getX() + 8, metricBox.getY() + 7, 130, 16, juce::Justification::left);

    g.setColour(mCurrentMetrics.smallSpeakerScore > 60.0f ? juce::Colour(0xff06b6d4) : juce::Colour(0xfff59e0b));
    g.setFont(juce::Font(12.0f, juce::Font::bold));
    g.drawText(juce::String(static_cast<int>(mCurrentMetrics.smallSpeakerScore)) + "%",
               metricBox.getRight() - 50, metricBox.getY() + 6, 42, 18, juce::Justification::right);

    // Spectrum Display Area
    auto specRect = juce::Rectangle<int>(16, 55, getWidth() - 32, 140);
    g.setColour(juce::Colour(0xff05070a));
    g.fillRoundedRectangle(specRect.toFloat(), 6.0f);
    g.setColour(juce::Colour(0xff1e293b));
    g.drawRoundedRectangle(specRect.toFloat(), 6.0f, 1.0f);

    // Section Labels
    g.setColour(juce::Colour(0xff64748b));
    g.setFont(10.0f);
    g.drawText("SUB (20-80Hz)", specRect.getX() + 10, specRect.getY() + 8, 100, 16, juce::Justification::left);
    g.drawText("BODY (80-180Hz)", specRect.getX() + 180, specRect.getY() + 8, 100, 16, juce::Justification::left);
    g.drawText("HARMONICS (200Hz+)", specRect.getX() + 380, specRect.getY() + 8, 120, 16, juce::Justification::left);

    // Macro Titles
    g.setColour(juce::Colours::white);
    g.setFont(juce::Font(11.0f, juce::Font::bold));
    g.drawText("SUB LEVEL", 40, 210, 80, 18, juce::Justification::centred);
    g.drawText("DRIVE", 160, 210, 80, 18, juce::Justification::centred);
    g.drawText("2ND HARM", 280, 210, 80, 18, juce::Justification::centred);
    g.drawText("3RD HARM", 400, 210, 80, 18, juce::Justification::centred);
    g.drawText("HEARABILITY", 520, 210, 90, 18, juce::Justification::centred);
}

void BassForgeAudioProcessorEditor::resized()
{
    mSubLevelSlider.setBounds(40, 235, 80, 80);
    mDistDriveSlider.setBounds(160, 235, 80, 80);
    mHarmonic2Slider.setBounds(280, 235, 80, 80);
    mHarmonic3Slider.setBounds(400, 235, 80, 80);
    mHearabilitySlider.setBounds(520, 235, 90, 90);

    mDistTypeBox.setBounds(160, 335, 120, 24);
    mSubProtectButton.setBounds(40, 335, 140, 24);
}

} // namespace BassForge
