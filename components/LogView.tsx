
import React, { useEffect, useRef } from 'react';
import { GameLog } from '../types';

interface LogViewProps {
  logs: GameLog[];
}

const LogView: React.FC<LogViewProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <span className="text-slate-400">SESSION_LOGS</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="animate-fadeIn">
            {log.type === 'action' && (
              <div className="flex gap-2">
                <span className="text-blue-400 flex-shrink-0">[PLAYER]</span>
                <span className="text-slate-200">"{log.content}"</span>
              </div>
            )}
            {log.type === 'feedback' && (
              <div className="flex gap-2">
                <span className="text-amber-500 flex-shrink-0">[NPC]</span>
                <span className="text-slate-300 italic">"{log.content}"</span>
              </div>
            )}
            {log.type === 'reflection' && (
              <div className="flex flex-col gap-1 bg-indigo-900/20 p-2 rounded border border-indigo-500/30">
                <div className="flex gap-2">
                  <span className="text-indigo-400 flex-shrink-0">REFLECTING...</span>
                  <span className="text-indigo-200 font-bold">{log.content}</span>
                </div>
              </div>
            )}
            {log.type === 'system' && (
              <div className="text-slate-500 border-l-2 border-slate-700 pl-2">
                {log.content}
              </div>
            )}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-700">Ready to initiate simulation sequence...</div>
        )}
      </div>
    </div>
  );
};

export default LogView;
