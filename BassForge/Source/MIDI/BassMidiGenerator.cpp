#include "BassMidiGenerator.h"

namespace BassForge::MIDI
{

void BassMidiGenerator::writeVLQ(std::vector<uint8_t>& buffer, uint32_t value)
{
    uint32_t v = value;
    uint8_t bytes[4];
    int count = 0;
    bytes[count++] = static_cast<uint8_t>(v & 0x7F);
    while ((v >>= 7) > 0)
    {
        bytes[count++] = static_cast<uint8_t>((v & 0x7F) | 0x80);
    }
    for (int i = count - 1; i >= 0; --i)
    {
        buffer.push_back(bytes[i]);
    }
}

void BassMidiGenerator::write32Bit(std::vector<uint8_t>& buffer, uint32_t value)
{
    buffer.push_back(static_cast<uint8_t>((value >> 24) & 0xFF));
    buffer.push_back(static_cast<uint8_t>((value >> 16) & 0xFF));
    buffer.push_back(static_cast<uint8_t>((value >> 8) & 0xFF));
    buffer.push_back(static_cast<uint8_t>(value & 0xFF));
}

void BassMidiGenerator::write16Bit(std::vector<uint8_t>& buffer, uint16_t value)
{
    buffer.push_back(static_cast<uint8_t>((value >> 8) & 0xFF));
    buffer.push_back(static_cast<uint8_t>(value & 0xFF));
}

void BassMidiGenerator::writeString(std::vector<uint8_t>& buffer, const std::string& str)
{
    for (char c : str)
    {
        buffer.push_back(static_cast<uint8_t>(c));
    }
}

std::vector<uint8_t> BassMidiGenerator::generateMidiFileBytes(
    const std::vector<Context::PatternStep>& pattern,
    double bpm,
    int ppq
)
{
    std::vector<uint8_t> trackBytes;

    // 1. Tempo Meta Event
    uint32_t mpqn = static_cast<uint32_t>(60000000.0 / bpm);
    trackBytes.push_back(0x00);
    trackBytes.push_back(0xFF);
    trackBytes.push_back(0x51);
    trackBytes.push_back(0x03);
    trackBytes.push_back(static_cast<uint8_t>((mpqn >> 16) & 0xFF));
    trackBytes.push_back(static_cast<uint8_t>((mpqn >> 8) & 0xFF));
    trackBytes.push_back(static_cast<uint8_t>(mpqn & 0xFF));

    // 2. Time Signature: 4/4
    trackBytes.push_back(0x00);
    trackBytes.push_back(0xFF);
    trackBytes.push_back(0x58);
    trackBytes.push_back(0x04);
    trackBytes.push_back(0x04);
    trackBytes.push_back(0x02);
    trackBytes.push_back(0x18);
    trackBytes.push_back(0x08);

    // 3. Track Name
    std::string trackName = "BassForge Bassline";
    trackBytes.push_back(0x00);
    trackBytes.push_back(0xFF);
    trackBytes.push_back(0x03);
    trackBytes.push_back(static_cast<uint8_t>(trackName.size()));
    writeString(trackBytes, trackName);

    uint32_t stepTicks = static_cast<uint32_t>(ppq / 4); // 16th note
    uint32_t lastEventTick = 0;

    for (size_t i = 0; i < pattern.size(); ++i)
    {
        const auto& step = pattern[i];
        uint32_t stepStartTick = static_cast<uint32_t>(i * stepTicks);

        if (step.active)
        {
            uint32_t deltaOn = stepStartTick - lastEventTick;
            writeVLQ(trackBytes, deltaOn);
            trackBytes.push_back(0x90); // Note On channel 1
            trackBytes.push_back(static_cast<uint8_t>(step.midiNote & 0x7F));
            trackBytes.push_back(static_cast<uint8_t>(step.velocity & 0x7F));
            lastEventTick = stepStartTick;

            uint32_t durationTicks = static_cast<uint32_t>(stepTicks * 0.88);
            uint32_t noteOffTick = stepStartTick + durationTicks;
            uint32_t deltaOff = noteOffTick - lastEventTick;
            writeVLQ(trackBytes, deltaOff);
            trackBytes.push_back(0x80); // Note Off channel 1
            trackBytes.push_back(static_cast<uint8_t>(step.midiNote & 0x7F));
            trackBytes.push_back(0x00);
            lastEventTick = noteOffTick;
        }
    }

    // End of Track
    uint32_t totalTicks = static_cast<uint32_t>(pattern.size() * stepTicks);
    if (lastEventTick < totalTicks)
    {
        writeVLQ(trackBytes, totalTicks - lastEventTick);
    }
    else
    {
        trackBytes.push_back(0x00);
    }
    trackBytes.push_back(0xFF);
    trackBytes.push_back(0x2F);
    trackBytes.push_back(0x00);

    // Build Header
    std::vector<uint8_t> fileBytes;
    writeString(fileBytes, "MThd");
    write32Bit(fileBytes, 6);
    write16Bit(fileBytes, 0); // Format 0
    write16Bit(fileBytes, 1); // 1 Track
    write16Bit(fileBytes, static_cast<uint16_t>(ppq));

    writeString(fileBytes, "MTrk");
    write32Bit(fileBytes, static_cast<uint32_t>(trackBytes.size()));
    fileBytes.insert(fileBytes.end(), trackBytes.begin(), trackBytes.end());

    return fileBytes;
}

} // namespace BassForge::MIDI
