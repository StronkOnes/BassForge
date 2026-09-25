cmake_minimum_required(VERSION 3.22)
project(BassForgeTests VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(BassForgeTests
    BassForgeTests.cpp
    ../Source/DSP/SubOscillator.cpp
    ../Source/DSP/HarmonicEngine.cpp
    ../Source/DSP/DistortionEngine.cpp
    ../Source/DSP/FrequencySplitter.cpp
    ../Source/Analysis/HearabilityAnalyzer.cpp
    ../Source/MusicalContext/BassContextEngine.cpp
    ../Source/MIDI/BassMidiGenerator.cpp
)

target_include_directories(BassForgeTests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/Plugin
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/DSP
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/Analysis
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/MusicalContext
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/MIDI
    ${CMAKE_CURRENT_SOURCE_DIR}/../Source/Presets
)

target_link_libraries(BassForgeTests PRIVATE
    juce::juce_audio_basics
    juce::juce_dsp
    juce::juce_core
)

add_test(NAME BassForgeDSPTests COMMAND BassForgeTests)
