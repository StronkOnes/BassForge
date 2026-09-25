import React from 'react';
import { X, Volume2, ShieldCheck, Download } from 'lucide-react';

interface DawGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DawGuideModal: React.FC<DawGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="bg-[#0b0d13] border border-zinc-700 rounded-xl max-w-2xl w-full p-6 text-zinc-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            DAW Routing & Preprocessor Guide
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Ableton Live Section */}
          <div className="bg-[#08090e] p-4 rounded-lg border border-zinc-800">
            <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
              1. Ableton Live (Live 11 / 12)
            </h3>
            <div className="space-y-2 text-zinc-300">
              <div>
                <strong className="text-zinc-100">As a Bass Instrument / MIDI Generator:</strong>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 mt-1 pl-1">
                  <li>Load <strong>BassForge VST3</strong> onto a MIDI Track.</li>
                  <li>Select your Key, Scale, and Chord progression.</li>
                  <li>Audition patterns with the built-in multi-layer bass engine.</li>
                  <li>Click <strong>Export .MID</strong> to drop standard 960 PPQ bass patterns into the Arrangement timeline.</li>
                </ol>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <strong className="text-zinc-100">As a Bass Preprocessor (Audio Track Insert):</strong>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 mt-1 pl-1">
                  <li>Drop BassForge onto an existing 808 or synth bass audio track.</li>
                  <li>Switch mode to <strong>3. PREPROCESSOR</strong>.</li>
                  <li>Enable <strong>Sub Protect</strong> (28Hz 24dB HPF) to clean up subsonic excursion.</li>
                  <li>Use the <strong>Hearability Panel</strong> to check small-speaker translation.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* FL Studio Section */}
          <div className="bg-[#08090e] p-4 rounded-lg border border-zinc-800">
            <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">
              2. FL Studio (21 / 24)
            </h3>
            <div className="space-y-2 text-zinc-300">
              <div>
                <strong className="text-zinc-100">Channel Rack Instrument:</strong>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 mt-1 pl-1">
                  <li>In the Channel Rack, add <strong>BassForge</strong> as an instrument generator.</li>
                  <li>Use the Piano Roll (C2 to C4) to play basslines with portamento glide.</li>
                  <li>Automate <strong>Drive</strong>, <strong>Sub Level</strong>, and <strong>Hearability</strong> via Automation Clips.</li>
                </ol>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <strong className="text-zinc-100">Mixer Insert Effect:</strong>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 mt-1 pl-1">
                  <li>On any mixer channel, load BassForge into an FX slot.</li>
                  <li>Engage <strong>Auto Gain Match</strong> to compare processed vs unprocessed bass without volume bias.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-[#0e121a] p-3 rounded-lg border border-cyan-900/40 text-[11px] text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200">The Hearability Philosophy:</strong> Never boost low sub energy to make bass audible on consumer hardware. Always inject targeted 2nd and 3rd harmonics so the brain psychoacoustically reconstructs the fundamental pitch!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
