
import React from 'react';
import { NPCType, GameStatus } from '../types';

interface GateVisualProps {
  status: GameStatus;
  npc: NPCType;
  activeDialogue: string | null;
  isNpcThinking?: boolean;
}

const GateVisual: React.FC<GateVisualProps> = ({ status, npc, activeDialogue, isNpcThinking }) => {
  const isSage = npc.id === 'sage';
  const isThinking = status === GameStatus.THINKING_ACTION || status === GameStatus.THINKING_REFLECTION;
  const isSuccess = status === GameStatus.SUCCESS;
  const isFailed = status === GameStatus.FAILED;

  return (
    <div className="relative w-full h-96 bg-[#010204] rounded-[2rem] overflow-hidden border border-white/5 shadow-inner perspective-1000">
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-all duration-[2000ms] ${isSage ? 'bg-indigo-950/20' : 'bg-cyan-950/20'}`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
      
      {/* Dynamic Particle/Dust Layer */}
      <div className="absolute inset-0 hologram-grid opacity-10 pointer-events-none"></div>

      {/* The Gate: 3D Perspective */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        <div className="relative w-80 h-full flex group">
          {/* Frame Arc */}
          <div className="absolute -inset-x-8 top-4 h-[95%] border-x-[12px] border-t-[12px] border-slate-900 rounded-t-[10rem] opacity-40 shadow-[0_-10px_40px_rgba(0,0,0,1)]"></div>
          
          {/* Doors */}
          <div className={`w-1/2 h-full bg-[#0a0f1d] border-r border-white/5 transition-all duration-[2500ms] origin-left relative ${isSuccess ? '-rotate-y-110 opacity-0' : ''}`}>
             <div className="absolute inset-4 border border-white/5 rounded-sm"></div>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800 rounded-full shadow-inner"></div>
          </div>
          <div className={`w-1/2 h-full bg-[#0a0f1d] border-l border-white/5 transition-all duration-[2500ms] origin-right relative ${isSuccess ? 'rotate-y-110 opacity-0' : ''}`}>
             <div className="absolute inset-4 border border-white/5 rounded-sm"></div>
             <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-800 rounded-full shadow-inner"></div>
          </div>
        </div>
      </div>

      {/* Character Sprite: Sage or Guardian */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-700 ${isThinking || isNpcThinking ? 'scale-110 -translate-y-4 brightness-110' : ''} ${isFailed ? 'animate-shake' : ''}`}>
        
        {/* Dialogue Bubble */}
        {(activeDialogue || isNpcThinking) && (
          <div className="absolute bottom-[110%] w-64 mb-6 animate-slideInUp z-30">
            <div className="speech-bubble p-4 text-center">
              {activeDialogue === "..." ? (
                <div className="flex justify-center gap-1.5 py-2">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-100 leading-relaxed italic">
                  {activeDialogue}
                </p>
              )}
            </div>
          </div>
        )}

        {isSage ? (
          <div className="relative flex flex-col items-center group">
             {/* Character Glow */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full ${isNpcThinking ? 'animate-pulse' : 'animate-pulse-glow'}`}></div>
             
             {/* The Sage Head */}
             <div className="w-24 h-24 bg-[#fee2e2] rounded-full border-2 border-amber-900 shadow-2xl relative z-10 flex items-center justify-center animate-float">
                {/* Face Details */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-8">
                  <div className={`w-3.5 h-3.5 bg-slate-900 rounded-full origin-center ${isNpcThinking ? 'animate-pulse' : 'animate-blink'}`}></div>
                  <div className={`w-3.5 h-3.5 bg-slate-900 rounded-full origin-center ${isNpcThinking ? 'animate-pulse' : 'animate-blink'}`}></div>
                </div>
                {/* The Legendary Beard */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-20 h-40 bg-white rounded-b-full border-x border-b border-slate-200 shadow-xl animate-sway origin-top">
                   <div className="w-full h-full bg-gradient-to-b from-transparent via-slate-100/30 to-slate-200/50 rounded-b-full"></div>
                </div>
             </div>
             
             {/* Robe/Body */}
             <div className="w-32 h-28 bg-indigo-950 rounded-t-[5rem] -mt-6 border-t border-indigo-500/20 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-amber-500/5 rounded-full"></div>
             </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center group">
             {/* Tech Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse-glow"></div>
             
             {/* Floating Core */}
             <div className={`w-20 h-20 bg-slate-900 border-2 border-cyan-400 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] z-10 animate-float ${isNpcThinking ? 'brightness-150' : ''}`}>
                <div className="w-10 h-10 bg-cyan-500/30 rounded-full border border-cyan-400 flex items-center justify-center -rotate-45">
                   <div className={`w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_cyan] ${isNpcThinking ? 'animate-ping' : 'animate-pulse'}`}></div>
                </div>
             </div>
             
             {/* Floating Modules */}
             <div className="flex gap-16 -mt-4">
                <div className="w-5 h-16 bg-slate-800 border-l border-cyan-500/30 rounded-full animate-float shadow-xl" style={{animationDelay: '0.2s'}}></div>
                <div className="w-5 h-16 bg-slate-800 border-r border-cyan-500/30 rounded-full animate-float shadow-xl" style={{animationDelay: '0.8s'}}></div>
             </div>
          </div>
        )}
      </div>

      {/* Interface Overlays for AI Planning */}
      {isThinking && (
        <div className="absolute inset-0 z-40 bg-blue-500/10 backdrop-blur-[2px] flex items-center justify-center animate-fadeIn">
           <div className="flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-cyan-500/20 border-b-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-blue-400 font-mono text-xs font-bold tracking-[0.4em] uppercase animate-pulse">
                  {status === GameStatus.THINKING_REFLECTION ? 'Synthesizing Insight' : 'Refining Strategy'}
                </span>
              </div>
           </div>
        </div>
      )}

      {/* Success Banner */}
      {isSuccess && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fadeIn">
            <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/50 text-emerald-400 px-16 py-8 rounded-[3rem] font-black tracking-[1em] text-2xl shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                AUTHORIZED
            </div>
        </div>
      )}
    </div>
  );
};

export default GateVisual;
