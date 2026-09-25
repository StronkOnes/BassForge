#pragma once
#include <vector>
#include <cstdint>
#include "../MusicalContext/BassContextEngine.h"

namespace BassForge::MIDI
{

class BassMidiGenerator
{
public:
    BassMidiGenerator() = default;

    static std::vector<uint8_t> generateMidiFileBytes(
        const std::vector<Context::PatternStep>& pattern,
        double bpm = 120.0,
        int ppq = 960
    );

private:
    static void writeVLQ(std::vector<uint8_t>& buffer, uint32_t value);
    static void write32Bit(std::vector<uint8_t>& buffer, uint32_t value);
    static void write16Bit(std::vector<uint8_t>& buffer, uint16_t value);
    static void writeString(std::vector<uint8_t>& buffer, const std::string& str);
};

} // namespace BassForge::MIDI
