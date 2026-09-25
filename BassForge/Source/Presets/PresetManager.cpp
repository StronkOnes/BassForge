#include "PresetManager.h"
#include <random>

namespace BassForge::Presets
{

PresetManager::PresetManager()
{
    initFactoryPresets();
}

void PresetManager::initFactoryPresets()
{
    mPresets = {
        {
            "sub_pure",
            "Subterranean Pure Sub",
            "Sub",
            "Rock-solid mono sub fundamental locked below 80 Hz.",
            0.95f, 0, 0.3f, 0.25f, 0.2f, 0.1f, 0.0f, 0, 0.1f, 0.15f, 0.45f
        },
        {
            "trap_808",
            "Hard Stomp Trap 808",
            "808",
            "Punchy saturated 808 with targeted 3rd harmonic for mobile speaker cut.",
            0.9f, 0, 0.65f, 0.6f, 0.4f, 0.65f, 0.35f, 2, 0.55f, 0.6f, 0.8f
        },
        {
            "speaker_808",
            "Speaker-Engineered 808",
            "808",
            "Engineered so fundamental cuts through laptop and phone speakers.",
            0.8f, 0, 0.7f, 0.45f, 0.6f, 0.55f, 0.25f, 3, 0.4f, 0.4f, 0.88f
        },
        {
            "reese_dark",
            "Cyberpunk Detuned Reese",
            "Reese",
            "Twin oscillator detuned movement with protected mono sub.",
            0.85f, 0, 0.8f, 0.7f, 0.5f, 0.45f, 0.35f, 5, 0.45f, 0.5f, 0.75f
        },
        {
            "acid_303",
            "Acid 303 Resonant Groove",
            "Synth Bass",
            "Biting squelch with resonant diode saturation.",
            0.75f, 1, 0.85f, 0.8f, 0.55f, 0.7f, 0.4f, 4, 0.65f, 0.6f, 0.82f
        },
        {
            "uk_garage",
            "UK Garage Organ Bass",
            "Synth Bass",
            "Warm hollow square body with bouncy envelope and punchy 2nd harmonic.",
            0.8f, 0, 0.8f, 0.5f, 0.3f, 0.6f, 0.4f, 2, 0.3f, 0.35f, 0.65f
        },
        {
            "rnb_neosoul",
            "Neo-Soul Warm Finger Bass",
            "R&B / Soul",
            "Warm wooden P-bass body with 2nd harmonic emphasis for vocal pocket clarity.",
            0.88f, 1, 0.72f, 0.45f, 0.65f, 0.35f, 0.58f, 3, 0.22f, 0.28f, 0.74f
        },
        {
            "rnb_trapsoul",
            "Trapsoul Long Glide 808",
            "R&B / Soul",
            "Deep sine sub with extended decay and pitch glide for atmospheric R&B.",
            0.98f, 0, 0.48f, 0.35f, 0.55f, 0.4f, 0.65f, 0, 0.38f, 0.42f, 0.78f
        },
        {
            "rnb_silk_moog",
            "90s Silk R&B Moog Sub",
            "R&B / Soul",
            "Creamy analog mini-bass sound with warm dual-pole filtering.",
            0.92f, 0, 0.65f, 0.38f, 0.5f, 0.35f, 0.5f, 2, 0.26f, 0.3f, 0.72f
        }
    };
}

const std::vector<Preset>& PresetManager::getFactoryPresets() const
{
    return mPresets;
}

const Preset* PresetManager::getPresetById(const std::string& id) const
{
    for (const auto& p : mPresets)
    {
        if (p.id == id) return &p;
    }
    return nullptr;
}

Preset PresetManager::randomize(bool preserveSub)
{
    std::random_device rd;
    std::mt19932 gen(rd());
    std::uniform_real_distribution<float> dis(0.0f, 1.0f);

    Preset p;
    p.id = "custom_random";
    p.name = "Mutated Bass";
    p.category = "Custom";
    p.description = "Intelligently randomized parameter set within stable acoustic bounds.";

    p.subLevel = preserveSub ? 0.85f : 0.6f + dis(gen) * 0.35f;
    p.subWave = preserveSub ? 0 : (dis(gen) > 0.5f ? 0 : 1);
    p.bodyLevel = 0.4f + dis(gen) * 0.5f;
    p.bodyTone = 0.3f + dis(gen) * 0.5f;
    p.harmonics2 = 0.2f + dis(gen) * 0.6f;
    p.harmonics3 = 0.2f + dis(gen) * 0.6f;
    p.harmonics5 = dis(gen) * 0.4f;
    p.distType = static_cast<int>(dis(gen) * 7.0f);
    p.distDrive = 0.2f + dis(gen) * 0.5f;
    p.distMix = 0.3f + dis(gen) * 0.4f;
    p.hearabilityTarget = 0.5f + dis(gen) * 0.4f;

    return p;
}

} // namespace BassForge::Presets
