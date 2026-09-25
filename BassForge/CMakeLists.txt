cmake_minimum_required(VERSION 3.22)
project(BassForge VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.4
    GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(JUCE)

juce_add_plugin(BassForge
    COMPANY_NAME "BassForge Audio"
    PLUGIN_MANUFACTURER_CODE BFga
    PLUGIN_CODE Bf01
    FORMATS VST3 Standalone
    PRODUCT_NAME "BassForge"
    IS_SYNTH TRUE
    NEEDS_MIDI_INPUT TRUE
    NEEDS_MIDI_OUTPUT TRUE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD FALSE
)

target_sources(BassForge PRIVATE
    Source/Plugin/PluginProcessor.h
    Source/Plugin/PluginProcessor.cpp
    Source/Plugin/PluginEditor.h
    Source/Plugin/PluginEditor.cpp
    Source/DSP/SubOscillator.h
    Source/DSP/SubOscillator.cpp
    Source/DSP/HarmonicEngine.h
    Source/DSP/HarmonicEngine.cpp
    Source/DSP/DistortionEngine.h
    Source/DSP/DistortionEngine.cpp
    Source/DSP/FrequencySplitter.h
    Source/DSP/FrequencySplitter.cpp
    Source/Analysis/HearabilityAnalyzer.h
    Source/Analysis/HearabilityAnalyzer.cpp
    Source/MusicalContext/BassContextEngine.h
    Source/MusicalContext/BassContextEngine.cpp
    Source/MIDI/BassMidiGenerator.h
    Source/MIDI/BassMidiGenerator.cpp
    Source/Presets/PresetManager.h
    Source/Presets/PresetManager.cpp
)

target_include_directories(BassForge PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/Source
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/Plugin
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/DSP
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/Analysis
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/MusicalContext
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/MIDI
    ${CMAKE_CURRENT_SOURCE_DIR}/Source/Presets
)

target_compile_definitions(BassForge PUBLIC
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
    JUCE_VST3_CAN_REPLACE_VST2=0
    DONT_SET_USING_JUCE_NAMESPACE=1
)

target_link_libraries(BassForge PRIVATE
    juce::juce_audio_utils
    juce::juce_audio_processors
    juce::juce_dsp
    juce::juce_gui_basics
    juce::juce_gui_extra
)

if(MSVC)
    target_compile_options(BassForge PRIVATE /W4 /O2 /fp:fast)
else()
    target_compile_options(BassForge PRIVATE -Wall -Wextra -O3 -ffast-math)
endif()

enable_testing()
add_subdirectory(Tests)
