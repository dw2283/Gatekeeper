
import React from 'react';
import { MemoryInsight } from '../types';

interface MemoryBankProps {
  memories: MemoryInsight[];
  isReflecting: boolean;
}

const MemoryBank: React.FC<MemoryBankProps> = ({ memories, isReflecting }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 h-full relative overflow-hidden">
      {/* Background Neural Lines Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-500"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500"></div>
      </div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 ${isReflecting ? 'animate-pulse' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.535 5.503a1 1 0 101.07 1.691 3.991 3.991 0 014.93 0 1 1 0 101.07-1.691 5.991 5.991 0 00-7.07 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-100 text-sm tracking-widest uppercase">MemVerse LTM</h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
          {memories.length} SLOTS
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar z-10">
        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-30">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 animate-spin-slow"></div>
            <p className="mt-4 text-xs font-mono">NEURAL_VOID</p>
          </div>
        ) : (
          [...memories].reverse().map((memory, index) => (
            <div 
              key={memory.id} 
              className={`bg-slate-950/80 border border-slate-800 p-4 rounded-xl transition-all duration-500 animate-slideInLeft ${index === 0 && isReflecting ? 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Memory_Frag #{memories.length - index}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium italic">"{memory.text}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryBank;
