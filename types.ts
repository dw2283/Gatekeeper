
export interface MemoryInsight {
  id: string;
  text: string;
  timestamp: number;
}

export interface GameLog {
  id: string;
  type: 'action' | 'feedback' | 'reflection' | 'system';
  content: string;
  episode: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  THINKING_ACTION = 'THINKING_ACTION',
  THINKING_REFLECTION = 'THINKING_REFLECTION',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED'
}

export interface NPCType {
  id: string;
  name: string;
  description: string;
  observation: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  rules: (input: string) => { isPass: boolean; feedback: string };
}
