import React, { useState } from 'react';
import { HardwarePluginView } from './components/HardwarePluginView';
import { CodeInspector } from './components/CodeInspector';
import { TestConsole } from './components/TestConsole';
import { DawGuideModal } from './components/DawGuideModal';
import { Sliders, FolderGit2, CheckCircle2, BookOpen, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'code' | 'tests'>('studio');
  const [isDawModalOpen, setIsDawModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Bar - Clean 3-zone Top Bar Contract */}
      <header className="border-b border-zinc-800/80 bg-[#0a0d14] px-4 md:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Zone 1: Single element wordmark & domain subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-white font-mono">BASSFORGE</span>
                <span className="text-xs text-zinc-500 font-mono">·</span>
                <span className="text-xs font-mono text-cyan-400">VST3 · C++20 · JUCE</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Intelligent Bass Generator & Acoustic Preprocessor
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-[#06080c] border border-zinc-800 rounded-lg">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-zinc-800/90 text-white font-semibold shadow-sm text-cyan-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Bass Laboratory
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-zinc-800/90 text-white font-semibold shadow-sm text-cyan-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              C++ Codebase & CMake
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-zinc-800/90 text-white font-semibold shadow-sm text-emerald-300'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              DSP Tests & Invariants
            </button>
          </nav>

          {/* Zone 3: DAW Integration Guide Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDawModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              DAW Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            <HardwarePluginView onOpenDawGuide={() => setIsDawModalOpen(true)} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeInspector />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6">
            <TestConsole />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#07090e] py-4 px-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>BassForge Audio · Windows 10/11 x64 VST3 & Standalone</span>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>Ableton Live Ready</span>
            <span>·</span>
            <span>FL Studio Ready</span>
            <span>·</span>
            <span>Standard MIDI (.mid) 960 PPQ</span>
            <span>·</span>
            <span>Linkwitz-Riley Crossover</span>
          </div>
        </div>
      </footer>

      {/* DAW Guide Modal */}
      <DawGuideModal isOpen={isDawModalOpen} onClose={() => setIsDawModalOpen(false)} />
    </div>
  );
}
