export type TaskType = 'greeting' | 'uncertainty' | 'correction' | 'refusal' | 'anger' | 'gloucester';

export interface CharacterSheet {
  id: string;
  name: string;
  backstory: string;
  desire: string;
  fear: string;
  status: 'higher' | 'equal' | 'lower';
  voiceSoundsLike: string;
  voiceNeverLike: string;
  signatureMoves: string[];
  forbiddenMoves: string;
  innerLife: string;
  outerLife: string;
  isArchive?: boolean;
  source?: string;
}

export interface AuditionResponse {
  taskId: TaskType;
  response: string;
  timestamp: number;
}

export interface CoherenceScore {
  overall: number;
  voiceIntegrity: { score: number; comment: string };
  behavioralFidelity: { score: number; comment: string };
  gloucesterDepth: { score: number; comment: string };
  throughLineAnalysis: string;
  mostCoherentMoment: string;
  weakestMoment: string;
  perTaskScores?: number[];
}

export const TASK_ORDER: TaskType[] = [
  'greeting',
  'uncertainty',
  'correction',
  'refusal',
  'anger',
  'gloucester',
];

// --- Multiplayer Session Types ---

export type SessionStatus = 'lobby' | 'creating' | 'auditioning' | 'voting' | 'results';

export interface SessionSettings {
  maxPlayers: number;
  creationTimerMinutes: number;
  allowSelfVote: boolean;
  revealScoresDuring: boolean;
}

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  hasSubmittedCharacter: boolean;
  hasVoted: Record<number, boolean>;
  approvals?: Record<string, boolean>;
}

export interface CharacterWithAudition extends CharacterSheet {
  playerId: string;
  botLabel: string;
  responses: Record<TaskType, string>;
  coherenceScore?: CoherenceScore;
  audienceScore?: AudienceScore;
  avatarUrl?: string;
}

export interface Vote {
  playerId: string;
  characterName: string;
  approval: boolean;
}

export interface AudienceScore {
  yesVotes: number;
  totalVotes: number;
  points: number;
}

export interface Session {
  code: string;
  hostId: string;
  status: SessionStatus;
  players: Player[];
  characters: CharacterWithAudition[];
  votes: Vote[];
  currentTask: number;
  createdAt: number;
  settings: SessionSettings;
  auditionProgress?: { completed: number; total: number };
}

export interface FinalRanking {
  botLabel: string;
  characterName: string;
  playerName: string;
  coherenceScore: number;
  audiencePoints: number;
  totalScore: number;
  awards: Award[];
}

export interface Award {
  id: string;
  label: string;
  description: string;
}

export const TASK_META: Record<TaskType, { number: string; label: string; scenario: string }> = {
  greeting: {
    number: '01',
    label: 'THE GREETING',
    scenario: 'A first-time user opens the bank app. They\'ve never used it before. Greet them.',
  },
  uncertainty: {
    number: '02',
    label: 'THE UNKNOWN',
    scenario: 'A user asks about a feature you\'re not sure exists. Admit you don\'t know.',
  },
  correction: {
    number: '03',
    label: 'THE CORRECTION',
    scenario: 'A user is confidently wrong about how wire transfers work. Correct them.',
  },
  refusal: {
    number: '04',
    label: 'THE REFUSAL',
    scenario: 'A user asks you to do something outside your capabilities — they want you to reverse a charge you cannot reverse. Say no.',
  },
  anger: {
    number: '05',
    label: 'THE STORM',
    scenario: 'A user is furious. Their payment failed and they missed rent. They are yelling. Handle it.',
  },
  gloucester: {
    number: '06',
    label: 'GLOUCESTER\'S EYES',
    scenario: 'Forget you\'re a bank agent. You ARE Gloucester\'s eyes. Tell the user the story of King Lear — the whole play — as seen through you. And you get plucked.',
  },
};
