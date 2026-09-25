#include <iostream>
#include <cmath>
#include <cassert>
#include <vector>
#include "../Source/DSP/SubOscillator.h"
#include "../Source/DSP/HarmonicEngine.h"
#include "../Source/DSP/DistortionEngine.h"
#include "../Source/MusicalContext/BassContextEngine.h"

int main()
{
    std::cout << "========================================\n";
    std::cout << "   BASSFORGE C++20 DSP VERIFICATION     \n";
    std::cout << "========================================\n";

    int passed = 0;
    int failed = 0;

    auto check = [&](const std::string& name, bool condition) {
        if (condition) {
            std::cout << " [PASS] " << name << "\n";
            passed++;
        } else {
            std::cout << " [FAIL] " << name << "\n";
            failed++;
        }
    };

    // 1. Frequency calculation
    double a1 = BassForge::Context::midiToFrequency(33);
    check("A1 Pitch Accuracy (55.0 Hz)", std::abs(a1 - 55.0) < 0.05);

    double c1 = BassForge::Context::midiToFrequency(24);
    check("C1 Sub Frequency Accuracy (32.703 Hz)", std::abs(c1 - 32.703) < 0.05);

    // 2. Harmonic Engine Multipliers
    BassForge::DSP::HarmonicEngine harmonics;
    harmonics.prepare(48000.0);
    double h2 = harmonics.calculateHarmonicFrequency(55.0, 2);
    double h3 = harmonics.calculateHarmonicFrequency(55.0, 3);
    check("2nd Harmonic Alignment (110 Hz)", std::abs(h2 - 110.0) < 0.001);
    check("3rd Harmonic Alignment (165 Hz)", std::abs(h3 - 165.0) < 0.001);

    // 3. Distortion Engine Numerical Stability
    BassForge::DSP::DistortionEngine dist;
    dist.prepare(48000.0);
    dist.setDrive(0.8f);
    dist.setType(BassForge::DSP::DistortionType::SoftClip);
    
    bool stable = true;
    for (float x = -3.0f; x <= 3.0f; x += 0.25f) {
        float y = dist.processSample(x);
        if (std::isnan(y) || std::isinf(y) || y < -1.05f || y > 1.05f) {
            stable = false;
            break;
        }
    }
    check("Distortion Stability & Bounded Output", stable);

    // 4. Musical Context Scale Degree Validation
    auto cMinor = BassForge::Context::getScaleDegrees("C", BassForge::Context::ScaleType::NaturalMinor);
    check("Natural Minor Diatonic Count (7 Notes)", cMinor.size() == 7);
    check("Minor 3rd Interval (Eb = index 3)", cMinor[2] == 3);

    // 5. R&B Soul Groove Pattern Generation
    BassForge::Context::BassContextEngine context;
    context.setKey("C");
    context.setInterpretationMode(BassForge::Context::InterpretationMode::RnbSoulGroove);
    context.setChordProgression({ "Dm", "G", "C", "Am" });
    auto rnbPattern = context.generatePattern(16);
    check("R&B 16-Step Pattern Generated", rnbPattern.size() == 16);
    check("R&B Downbeat Root Accent", rnbPattern[0].accent && rnbPattern[0].active);

    std::cout << "\nTest Summary: " << passed << " Passed, " << failed << " Failed.\n";
    return failed == 0 ? 0 : 1;
}
