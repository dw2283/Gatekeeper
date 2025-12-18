
import React, { useState, useEffect, useRef } from 'react';
import { MemoryInsight, GameLog, GameStatus, NPCType } from './types';
import { NPCS } from './constants';
import { geminiService } from './services/geminiService';
import { soundService } from './services/soundService';
import GateVisual from './components/GateVisual';
import MemoryBank from './components/MemoryBank';
import LogView from './components/LogView';

const App: React.FC = () => {
  const [episode, setEpisode] = useState(1);
  const [memories, setMemories] = useState<MemoryInsight[]>([]);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [currentNPC, setCurrentNPC] = useState<NPCType>(NPCS[0]);
  
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN'; 

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setUserInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const addLog = (type: GameLog['type'], content: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      episode
    }]);
  };

  const handleExecute = async () => {
    if (status !== GameStatus.IDLE && status !== GameStatus.FAILED) return;
    if (mode === 'MANUAL' && !userInput.trim()) return;

    setStatus(GameStatus.THINKING_ACTION);
    soundService.playThinking();
    addLog('system', `>>> ATTEMPT ${episode} INITIATED [${mode} MODE]`);

    try {
      let actionText = '';
      if (mode === 'AUTO') {
        actionText = await geminiService.generateAction(currentNPC.observation, memories.map(m => m.text));
      } else {
        actionText = userInput.trim();
        setUserInput('');
      }

      addLog('action', actionText);

      const { isPass, feedback } = currentNPC.rules(actionText);
      
      // NPC Interaction sequence
      soundService.playFeedback();
      setActiveDialogue(feedback); // Trigger visual bubble
      await geminiService.speak(feedback, currentNPC.voice);
      
      // Wait a bit for dialogue to be read
      setTimeout(() => setActiveDialogue(null), feedback.length * 100 + 2000);
      
      addLog('feedback', feedback);

      if (isPass) {
        setStatus(GameStatus.SUCCESS);
        soundService.playSuccess();
        addLog('system', "ACCESS GRANTED. MEMORY EVOLUTION COMPLETE.");
      } else {
        setStatus(GameStatus.THINKING_REFLECTION);
        soundService.playThinking();
        
        const reflection = await geminiService.generateReflection(actionText, feedback);
        soundService.playReflection();
        
        const newMemory: MemoryInsight = {
          id: Math.random().toString(36).substr(2, 9),
          text: reflection,
          timestamp: Date.now(),
        };

        setMemories(prev => [...prev, newMemory]);
        addLog('reflection', reflection);
        
        setEpisode(prev => prev + 1);
        setStatus(GameStatus.FAILED);
        
        if (episode >= 10) {
          setStatus(GameStatus.FINISHED);
          addLog('system', "MAX ITERATIONS REACHED.");
        }
      }
    } catch (err) {
      console.error(err);
      addLog('system', "NEURAL LINK INTERRUPTED. RETRYING...");
      setStatus(GameStatus.FAILED);
      setActiveDialogue(null);
    }
  };

  const resetGame = (npc?: NPCType) => {
    setEpisode(1);
    setMemories([]);
    setLogs([]);
    setStatus(GameStatus.IDLE);
    setUserInput('');
    setActiveDialogue(null);
    if (npc) setCurrentNPC(npc);
  };

  const isThinking = status.includes('THINKING');

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#02040a] text-slate-100">
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent italic tracking-tighter">
            MEMVERSE: EVOLVE
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
             <span className="text-slate-500 text-[11px] font-mono tracking-[0.2em] uppercase">Neural Protocol Activated</span>
          </div>
        </div>

        <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
          <button
            onClick={() => setMode('AUTO')}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'AUTO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            AUTO
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === 'MANUAL' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            MANUAL
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            {NPCS.map(n => (
              <button 
                key={n.id} 
                onClick={() => resetGame(n)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${currentNPC.id === n.id ? 'bg-slate-800 text-white border-white/20' : 'text-slate-600 border-transparent hover:text-slate-400'}`}
              >
                {n.id}
              </button>
            ))}
          </div>
          <button onClick={() => resetGame()} className="p-2.5 text-slate-500 hover:text-white transition-colors" title="Reset Simulation">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <GateVisual status={status} npc={currentNPC} activeDialogue={activeDialogue} />
          
          {mode === 'MANUAL' && (
            <div className="flex gap-3 items-center bg-slate-900/30 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Negotiate with the gatekeeper..."
                className="flex-1 bg-[#0a0f1d] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700"
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              />
              <button 
                onClick={toggleListening}
                className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="Voice Input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={handleExecute}
                disabled={isThinking || !userInput.trim()}
                className="bg-purple-600 hover:bg-purple-500 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                Send
              </button>
            </div>
          )}

          {mode === 'AUTO' && (
             <button 
                onClick={handleExecute}
                disabled={status === GameStatus.SUCCESS || isThinking}
                className={`w-full py-6 rounded-[2rem] font-black tracking-[0.4em] text-sm uppercase transition-all shadow-2xl relative group overflow-hidden ${status === GameStatus.SUCCESS ? 'bg-emerald-600 cursor-default' : 'bg-blue-600 hover:bg-blue-500'}`}
             >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms]"></div>
                <span className="relative z-10">
                  {status === GameStatus.SUCCESS ? 'PROTOCOL SUCCESS' : isThinking ? 'PROCESSING...' : 'INITIATE EVOLUTION'}
                </span>
             </button>
          )}

          <div className="h-[400px]">
            <LogView logs={logs} />
          </div>
        </div>

        <div className="lg:col-span-4 h-full flex flex-col gap-8">
          <MemoryBank memories={memories} isReflecting={status === GameStatus.THINKING_REFLECTION} />
          
          <div className="bg-slate-900/20 rounded-[2rem] p-8 border border-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Evolution Data</h3>
             </div>
             <div className="space-y-6">
                <StatEntry label="Neural Depth" value={`${episode}/10`} progress={(episode/10)*100} color="bg-blue-500" />
                <StatEntry label="Synapse Count" value={`${memories.length}`} progress={Math.min((memories.length/5)*100, 100)} color="bg-cyan-500" />
                <StatEntry label="Passage Probability" value={status === GameStatus.SUCCESS ? '100%' : `${episode * 10}%`} progress={status === GameStatus.SUCCESS ? 100 : episode * 10} color="bg-emerald-500" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatEntry = ({ label, value, progress, color }: { label: string, value: string, progress: number, color: string }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-bold">{value}</span>
    </div>
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}></div>
    </div>
  </div>
);

export default App;
