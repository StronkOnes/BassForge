#include "PluginProcessor.h"
#include "PluginEditor.h"

namespace BassForge
{

juce::AudioProcessorValueTreeState::ParameterLayout BassForgeAudioProcessor::createParameterLayout()
{
    std::vector<std::unique_ptr<juce::RangedAudioParameter>> params;

    // Sub Layer
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "sub_level", 1 }, "Sub Level", 0.0f, 1.0f, 0.85f));
    params.push_back(std::make_unique<juce::AudioParameterChoice>(
        juce::ParameterID { "sub_wave", 1 }, "Sub Waveform", juce::StringArray { "Sine", "Triangle", "Square" }, 0));
    params.push_back(std::make_unique<juce::AudioParameterInt>(
        juce::ParameterID { "sub_octave", 1 }, "Sub Octave", -2, 0, -1));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "sub_glide", 1 }, "Sub Glide", 0.005f, 0.4f, 0.05f));

    // Body Layer
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "body_level", 1 }, "Body Level", 0.0f, 1.0f, 0.65f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "body_tone", 1 }, "Body Tone", 0.0f, 1.0f, 0.5f));

    // Targeted Harmonics
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_2", 1 }, "2nd Harmonic", 0.0f, 1.0f, 0.4f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_3", 1 }, "3rd Harmonic", 0.0f, 1.0f, 0.3f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_4", 1 }, "4th Harmonic", 0.0f, 1.0f, 0.15f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_5", 1 }, "5th Harmonic", 0.0f, 1.0f, 0.2f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_7", 1 }, "7th Harmonic", 0.0f, 1.0f, 0.1f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "harmonic_even_odd", 1 }, "Even/Odd Balance", -1.0f, 1.0f, 0.0f));

    // Distortion
    params.push_back(std::make_unique<juce::AudioParameterChoice>(
        juce::ParameterID { "dist_type", 1 }, "Distortion Type",
        juce::StringArray { "Soft Clip", "Hard Clip", "Tube", "Tape", "Diode", "Transistor", "Wavefold", "Bit Reduction" }, 2));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "dist_drive", 1 }, "Distortion Drive", 0.0f, 1.0f, 0.35f));
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "dist_mix", 1 }, "Distortion Mix", 0.0f, 1.0f, 0.45f));

    // Hearability Macro & Diagnostics
    params.push_back(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID { "macro_hearability", 1 }, "Hearability Macro", 0.0f, 1.0f, 0.6f));
    params.push_back(std::make_unique<juce::AudioParameterBool>(
        juce::ParameterID { "sub_protect", 1 }, "Sub Protect (28Hz)", true));
    params.push_back(std::make_unique<juce::AudioParameterBool>(
        juce::ParameterID { "gain_match", 1 }, "Auto Gain Match", true));

    return { params.begin(), params.end() };
}

BassForgeAudioProcessor::BassForgeAudioProcessor()
    : AudioProcessor(BusesProperties()
                     .withInput("Input", juce::AudioChannelSet::stereo(), true)
                     .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      mAPVTS(*this, nullptr, "Parameters", createParameterLayout())
{
}

BassForgeAudioProcessor::~BassForgeAudioProcessor() = default;

const juce::String BassForgeAudioProcessor::getName() const { return "BassForge"; }
bool BassForgeAudioProcessor::acceptsMidi() const { return true; }
bool BassForgeAudioProcessor::producesMidi() const { return true; }
bool BassForgeAudioProcessor::isMidiEffect() const { return false; }
double BassForgeAudioProcessor::getTailLengthSeconds() const { return 0.0; }
int BassForgeAudioProcessor::getNumPrograms() { return 1; }
int BassForgeAudioProcessor::getCurrentProgram() { return 0; }
void BassForgeAudioProcessor::setCurrentProgram(int) {}
const juce::String BassForgeAudioProcessor::getProgramName(int) { return {}; }
void BassForgeAudioProcessor::changeProgramName(int, const juce::String&) {}

void BassForgeAudioProcessor::prepareToPlay(double sampleRate, int samplesPerBlock)
{
    mSampleRate = sampleRate;
    mSubOsc.prepare(sampleRate);
    mHarmonicEngine.prepare(sampleRate);
    mDistortionEngine.prepare(sampleRate);
    mFrequencySplitter.prepare(sampleRate);
    mHearabilityAnalyzer.prepare(sampleRate);

    // Initialize 28Hz highpass sub protection filter
    *mSubProtectFilter.state = *juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, 28.0f);
    juce::dsp::ProcessSpec spec { sampleRate, static_cast<juce::uint32>(samplesPerBlock), 2 };
    mSubProtectFilter.prepare(spec);
}

void BassForgeAudioProcessor::releaseResources()
{
    mSubOsc.reset();
    mHarmonicEngine.reset();
    mDistortionEngine.reset();
    mFrequencySplitter.reset();
    mHearabilityAnalyzer.reset();
}

bool BassForgeAudioProcessor::isBusesLayoutSupported(const BusesLayout& layouts) const
{
    return layouts.getMainOutputChannelSet() == juce::AudioChannelSet::stereo()
        || layouts.getMainOutputChannelSet() == juce::AudioChannelSet::mono();
}

void BassForgeAudioProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    const int numSamples = buffer.getNumSamples();

    // 1. Process MIDI Events
    for (const auto metadata : midiMessages)
    {
        const auto msg = metadata.getMessage();
        if (msg.isNoteOn())
        {
            mActiveMidiNote = msg.getNoteNumber();
            mCurrentVelocity = msg.getFloatVelocity();
            double freq = Context::midiToFrequency(mActiveMidiNote);
            float glide = mAPVTS.getRawParameterValue("sub_glide")->load();
            mSubOsc.setTargetFrequency(freq, glide);
            mHarmonicEngine.setFundamentalFrequency(freq);
        }
        else if (msg.isNoteOff() && msg.getNoteNumber() == mActiveMidiNote)
        {
            mActiveMidiNote = -1;
            mCurrentVelocity = 0.0f;
        }
    }

    // 2. Read Parameters
    float subLevel = mAPVTS.getRawParameterValue("sub_level")->load();
    int subWave = static_cast<int>(mAPVTS.getRawParameterValue("sub_wave")->load());
    int subOct = static_cast<int>(mAPVTS.getRawParameterValue("sub_octave")->load());
    mSubOsc.setLevel(subLevel);
    mSubOsc.setWaveform(static_cast<DSP::SubWaveform>(subWave));
    mSubOsc.setOctave(subOct);

    float h2 = mAPVTS.getRawParameterValue("harmonic_2")->load();
    float h3 = mAPVTS.getRawParameterValue("harmonic_3")->load();
    float h4 = mAPVTS.getRawParameterValue("harmonic_4")->load();
    float h5 = mAPVTS.getRawParameterValue("harmonic_5")->load();
    float h7 = mAPVTS.getRawParameterValue("harmonic_7")->load();
    float evenOdd = mAPVTS.getRawParameterValue("harmonic_even_odd")->load();
    mHarmonicEngine.setHarmonicLevels(h2, h3, h4, h5, h7, 0.05f);
    mHarmonicEngine.setEvenOddBalance(evenOdd);

    int distType = static_cast<int>(mAPVTS.getRawParameterValue("dist_type")->load());
    float distDrive = mAPVTS.getRawParameterValue("dist_drive")->load();
    float distMix = mAPVTS.getRawParameterValue("dist_mix")->load();
    mDistortionEngine.setType(static_cast<DSP::DistortionType>(distType));
    mDistortionEngine.setDrive(distDrive);
    mDistortionEngine.setMix(distMix);

    bool subProtectOn = mAPVTS.getRawParameterValue("sub_protect")->load() > 0.5f;

    // 3. Audio Synthesis & Preprocessing Buffer Loop
    auto* left = buffer.getWritePointer(0);
    auto* right = buffer.getNumChannels() > 1 ? buffer.getWritePointer(1) : nullptr;

    for (int i = 0; i < numSamples; ++i)
    {
        float synthSample = 0.0f;
        if (mActiveMidiNote >= 0)
        {
            float subSig = mSubOsc.processSample();
            float harmSig = mHarmonicEngine.processSample();
            synthSample = (subSig + harmSig) * mCurrentVelocity;
        }

        // Add incoming input if operated in PRE mode
        float inSample = left[i];
        float combined = inSample + synthSample;

        // Multiband & Distortion
        float processed = mDistortionEngine.processSample(combined);

        // Acoustic analysis
        mHearabilityAnalyzer.pushSample(processed);

        left[i] = processed;
        if (right) right[i] = processed;
    }

    // 4. Sub Protection Filter Block
    if (subProtectOn)
    {
        juce::dsp::AudioBlock<float> block(buffer);
        juce::dsp::ProcessContextReplacing<float> context(block);
        mSubProtectFilter.process(context);
    }
}

bool BassForgeAudioProcessor::hasEditor() const { return true; }

juce::AudioProcessorEditor* BassForgeAudioProcessor::createEditor()
{
    return new BassForgeAudioProcessorEditor(*this);
}

void BassForgeAudioProcessor::getStateInformation(juce::MemoryBlock& destData)
{
    auto state = mAPVTS.copyState();
    std::unique_ptr<juce::XmlElement> xml(state.createXml());
    copyXmlToBinary(*xml, destData);
}

void BassForgeAudioProcessor::setStateInformation(const void* data, int sizeInBytes)
{
    std::unique_ptr<juce::XmlElement> xml(getXmlFromBinary(data, sizeInBytes));
    if (xml != nullptr && xml->hasTagName(mAPVTS.state.getType()))
    {
        mAPVTS.replaceState(juce::ValueTree::fromXml(*xml));
    }
}

} // namespace BassForge

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new BassForge::BassForgeAudioProcessor();
}
