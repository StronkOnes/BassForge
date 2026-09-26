import React, { useState } from 'react';
import { HardwarePluginView } from './components/HardwarePluginView';
import { CodeInspector } from './components/CodeInspector';
import { TestConsole } from './components/TestConsole';
import { DawGuideModal } from './components/DawGuideModal';
import { Sliders, FolderGit2, CheckCircle2, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'code' | 'tests'>('studio');
  const [isDawModalOpen, setIsDawModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Navigation) - Zone 3 (Action) */}
      <header className="border-b border-zinc-800/80 bg-[#090b12] px-4 md:px-8 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single element wordmark */}
          <span className="font-mono font-black text-lg tracking-wider text-white">
            BassForge Audio
          </span>

          {/* Zone 2: Navigation Links / Mode Selectors */}
          <nav className="flex items-center gap-1.5 p-1 bg-[#05070c] border border-zinc-800 rounded-lg">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-zinc-800 text-cyan-300 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>VST3 Bass Rack</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-zinc-800 text-blue-300 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>C++ DSP Codebase</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-zinc-800 text-emerald-300 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verification Tests</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDawModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 cursor-pointer transition-colors whitespace-nowrap shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>DAW Integration Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6">
        {activeTab === 'studio' && (
          <HardwarePluginView onOpenDawGuide={() => setIsDawModalOpen(true)} />
        )}

        {activeTab === 'code' && (
          <CodeInspector />
        )}

        {activeTab === 'tests' && (
          <TestConsole />
        )}
      </main>

      {/* Clean Studio Footer */}
      <footer className="border-t border-zinc-900 bg-[#05070c] py-3.5 px-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>BassForge DSP · JUCE / C++20 VST3 Architecture</span>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>Ableton Live Ready</span>
            <span aria-hidden="true">·</span>
            <span>FL Studio Ready</span>
            <span aria-hidden="true">·</span>
            <span>Standard MIDI (.mid) 960 PPQ</span>
            <span aria-hidden="true">·</span>
            <span>Linkwitz-Riley Crossover</span>
          </div>
        </div>
      </footer>

      {/* DAW Guide Modal */}
      <DawGuideModal isOpen={isDawModalOpen} onClose={() => setIsDawModalOpen(false)} />
    </div>
  );
}
