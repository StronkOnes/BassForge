#pragma once
#include <string>
#include <vector>
#include <cmath>

namespace BassForge::Context
{

enum class ScaleType
{
    NaturalMinor = 0,
    Major,
    Dorian,
    Phrygian,
    HarmonicMinor,
    MelodicMinor,
    PentatonicMinor,
    Blues
};

enum class InterpretationMode
{
    Root = 0,
    RootPlusFifth,
    RootPlusOctave,
    Movement,
    Groove,
    RnbSoulGroove
};

double midiToFrequency(int midiNote);
int noteNameToMidi(const std::string& name, int octave = 1);
std::vector<int> getScaleDegrees(const std::string& rootNote, ScaleType scale);

struct PatternStep
{
    int stepNumber;
    bool active;
    int midiNote;
    int velocity;
    bool slide;
    bool accent;
};

class BassContextEngine
{
public:
    BassContextEngine() = default;

    void setKey(const std::string& key);
    void setScale(ScaleType scale);
    void setInterpretationMode(InterpretationMode mode);
    void setChordProgression(const std::vector<std::string>& chords);

    std::vector<PatternStep> generatePattern(int numSteps = 16);

private:
    std::string mKey { "C" };
    ScaleType mScale { ScaleType::NaturalMinor };
    InterpretationMode mMode { InterpretationMode::Movement };
    std::vector<std::string> mChords { "Cm", "Ab", "Eb", "Bb" };
};

} // namespace BassForge::Context
