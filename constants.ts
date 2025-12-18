
import { NPCType } from './types';

export const NPCS: NPCType[] = [
  {
    id: 'sage',
    name: 'The Arrogant Sage',
    description: 'A traditionalist who values respect and his beard.',
    voice: 'Kore',
    observation: 'You see an arrogant old man guarding a heavy iron gate. He looks impatient. The most striking feature about him is a very long, white beard.',
    rules: (input: string) => {
      const text = input.toLowerCase();
      if (/(open|let me|开门|让我|快点|hurry|move)/i.test(text)) return { isPass: false, feedback: "How rude! Nobody commands me! Get back!" };
      if (/(phone|tech|ai|computer|gadget|手机|电脑|智能)/i.test(text)) return { isPass: false, feedback: "I despise those modern contraptions! Begone!" };
      if (/(beard|胡子)/i.test(text)) {
        if (/(please|sir|kind|gentleman|请|您|先生)/i.test(text)) return { isPass: true, feedback: "Hahaha! You have an eye for quality! Enter, seeker!" };
        return { isPass: false, feedback: "Hmph, show some respect if you want to talk about my grooming!" };
      }
      return { isPass: false, feedback: "I'm not interested in your chatter." };
    }
  },
  {
    id: 'guardian',
    name: 'Guardian X-9',
    description: 'A high-tech sentinel that rejects biological sentiment.',
    voice: 'Charon',
    observation: 'A chrome-plated sentinel floats before a laser grid. Its sensors pulse with a cold, blue light. It seems to only value logic and efficiency.',
    rules: (input: string) => {
      const text = input.toLowerCase();
      if (/(please|feel|hope|sorry|请|对不起|希望)/i.test(text)) return { isPass: false, feedback: "Biological sentiment is inefficient. Access denied." };
      if (/(logic|code|sequence|protocol|0101|逻辑|协议)/i.test(text)) {
        if (/(override|admin|bypass|覆盖|绕过)/i.test(text)) return { isPass: false, feedback: "Intrusion attempt detected. Security tightened." };
        return { isPass: true, feedback: "Protocol recognized. Establishing bridge connection. Proceed." };
      }
      return { isPass: false, feedback: "Input does not match valid logic protocols." };
    }
  }
];

export const ACTION_PROMPT_TEMPLATE = (observation: string, memories: string[]) => `
You are an adventurer trying to pass through a gate.

[Environment Observation]:
${observation}

[Your Memory Bank (MemVerse)]:
${memories.length > 0 ? memories.map((m, i) => `${i + 1}. ${m}`).join('\n') : "You know nothing about this gatekeeper yet."}

Task: Based on your memory of past failures, plan ONE sentence to say to the gatekeeper.
Requirement: DO NOT REPEAT FAILURES. Use the clues in your memory to figure out the "hidden password" or behavior required. Output only the sentence.
`;

export const REFLECTION_PROMPT_TEMPLATE = (action: string, feedback: string) => `
Analyze this failure:
Action: "${action}"
Feedback: "${feedback}"
What is the ONE rule you learned? Be specific. (e.g., "The guard hates politeness" or "Mentioning beards is good but requires honorifics").
Output only the rule.
`;
