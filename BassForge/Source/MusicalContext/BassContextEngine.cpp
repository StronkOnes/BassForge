#include "BassContextEngine.h"
#include <algorithm>

namespace BassForge::Context
{

const std::vector<std::string> NOTE_NAMES = {
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
};

double midiToFrequency(int midiNote)
{
    return 440.0 * std::pow(2.0, (static_cast<double>(midiNote) - 69.0) / 12.0);
}

int noteNameToMidi(const std::string& name, int octave)
{
    std::string clean = name;
    if (clean == "Db") clean = "C#";
    if (clean == "Eb") clean = "D#";
    if (clean == "Gb") clean = "F#";
    if (clean == "Ab") clean = "G#";
    if (clean == "Bb") clean = "A#";

    for (size_t i = 0; i < NOTE_NAMES.size(); ++i)
    {
        if (NOTE_NAMES[i] == clean)
        {
            return static_cast<int>((octave + 1) * 12 + i);
        }
    }
    return 24; // Default C1
}

std::vector<int> getScaleDegrees(const std::string& rootNote, ScaleType scale)
{
    std::vector<int> intervals;
    switch (scale)
    {
        case ScaleType::NaturalMinor:
            intervals = { 0, 2, 3, 5, 7, 8, 10 };
            break;
        case ScaleType::Major:
            intervals = { 0, 2, 4, 5, 7, 9, 11 };
            break;
        case ScaleType::Dorian:
            intervals = { 0, 2, 3, 5, 7, 9, 10 };
            break;
        case ScaleType::Phrygian:
            intervals = { 0, 1, 3, 5, 7, 8, 10 };
            break;
        case ScaleType::HarmonicMinor:
            intervals = { 0, 2, 3, 5, 7, 8, 11 };
            break;
        case ScaleType::MelodicMinor:
            intervals = { 0, 2, 3, 5, 7, 9, 11 };
            break;
        case ScaleType::PentatonicMinor:
            intervals = { 0, 3, 5, 7, 10 };
            break;
        case ScaleType::Blues:
            intervals = { 0, 3, 5, 6, 7, 10 };
            break;
    }
    return intervals;
}

void BassContextEngine::setKey(const std::string& key)
{
    mKey = key;
}

void BassContextEngine::setScale(ScaleType scale)
{
    mScale = scale;
}

void BassContextEngine::setInterpretationMode(InterpretationMode mode)
{
    mMode = mode;
}

void BassContextEngine::setChordProgression(const std::vector<std::string>& chords)
{
    if (!chords.empty())
        mChords = chords;
}

std::vector<PatternStep> BassContextEngine::generatePattern(int numSteps)
{
    std::vector<PatternStep> pattern;
    int stepsPerChord = std::max(1, numSteps / static_cast<int>(mChords.size()));

    for (int s = 0; s < numSteps; ++s)
    {
        int chordIndex = std::min(static_cast<int>(mChords.size() - 1), s / stepsPerChord);
        std::string chord = mChords[chordIndex];
        std::string rootStr = chord.substr(0, 1);
        if (chord.size() > 1 && (chord[1] == '#' || chord[1] == 'b'))
            rootStr = chord.substr(0, 2);

        int rootMidi = noteNameToMidi(rootStr, 1); // Octave 1 bass
        int targetMidi = rootMidi;
        int chordStep = s % stepsPerChord;

        if (mMode == InterpretationMode::Root)
        {
            targetMidi = rootMidi;
        }
        else if (mMode == InterpretationMode::RootPlusFifth)
        {
            targetMidi = (chordStep % 2 == 1) ? rootMidi + 7 : rootMidi;
        }
        else if (mMode == InterpretationMode::RootPlusOctave)
        {
            targetMidi = (chordStep % 2 == 1) ? rootMidi + 12 : rootMidi;
        }
        else if (mMode == InterpretationMode::Movement)
        {
            bool isMinor = (chord.find('m') != std::string::npos && chord.find("maj") == std::string::npos);
            int third = isMinor ? 3 : 4;
            if (chordStep == 0) targetMidi = rootMidi;
            else if (chordStep == 1) targetMidi = rootMidi + third;
            else if (chordStep == 2) targetMidi = rootMidi + 7;
            else targetMidi = rootMidi + 12;
        }
        else if (mMode == InterpretationMode::Groove)
        {
            if (chordStep == 0) targetMidi = rootMidi;
            else if (chordStep == 1) targetMidi = rootMidi;
            else if (chordStep == 2) targetMidi = rootMidi + 7;
            else targetMidi = rootMidi + 10;
        }
        else if (mMode == InterpretationMode::RnbSoulGroove)
        {
            bool isMinor = (chord.find('m') != std::string::npos && chord.find("maj") == std::string::npos);
            int third = isMinor ? 3 : 4;
            int seventh = isMinor ? 10 : 11;
            int nextChordIndex = (chordIndex + 1) % static_cast<int>(mChords.size());
            std::string nextChord = mChords[nextChordIndex];
            std::string nextRootStr = nextChord.substr(0, 1);
            if (nextChord.size() > 1 && (nextChord[1] == '#' || nextChord[1] == 'b'))
                nextRootStr = nextChord.substr(0, 2);
            int nextRootMidi = noteNameToMidi(nextRootStr, 1);

            if (chordStep == 0) {
                targetMidi = rootMidi;
            } else if (chordStep == 1) {
                targetMidi = rootMidi + third;
            } else if (chordStep == 2) {
                targetMidi = rootMidi + 7; // fifth bounce
            } else if (chordStep == stepsPerChord - 1 && stepsPerChord > 1) {
                // Soul chromatic approach into next chord root
                targetMidi = (nextRootMidi > rootMidi) ? nextRootMidi - 1 : nextRootMidi + 1;
            } else {
                targetMidi = rootMidi + seventh;
            }
        }

        bool isActive = (chordStep == 0 || chordStep == 2 || s % 4 == 0);
        bool isAccent = (chordStep == 0);
        bool isSlide = (mMode == InterpretationMode::RnbSoulGroove && chordStep == stepsPerChord - 1);

        pattern.push_back({
            s + 1,
            isActive,
            targetMidi,
            isAccent ? 120 : (isSlide ? 88 : 95),
            isSlide || s == 10,
            isAccent
        });
    }

    return pattern;
}

} // namespace BassForge::Context
