#pragma once
#include <string>
#include <vector>
#include <memory>

namespace BassForge::Presets
{

struct Preset
{
    std::string id;
    std::string name;
    std::string category;
    std::string description;
    float subLevel;
    int subWave;
    float bodyLevel;
    float bodyTone;
    float harmonics2;
    float harmonics3;
    float harmonics5;
    int distType;
    float distDrive;
    float distMix;
    float hearabilityTarget;
};

class PresetManager
{
public:
    PresetManager();

    const std::vector<Preset>& getFactoryPresets() const;
    const Preset* getPresetById(const std::string& id) const;

    Preset randomize(bool preserveSub = true);

private:
    std::vector<Preset> mPresets;
    void initFactoryPresets();
};

} // namespace BassForge::Presets
