import type { Session, SessionSettings, Player, CharacterSheet, CharacterWithAudition, Vote, TaskType } from "./types";

const globalStore = globalThis as unknown as { __sessions?: Map<string, Session> };
if (!globalStore.__sessions) {
  globalStore.__sessions = new Map<string, Session>();
}
const sessions = globalStore.__sessions;

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code: string;
  do {
    code = Array.from({ length: 4 }, () =>
      SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
    ).join("");
  } while (sessions.has(code));
  return code;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pruneExpired() {
  const now = Date.now();
  for (const [code, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(code);
    }
  }
}

const BOT_LABELS = "ABCDEFGHIJKLMNOPQRST".split("").map((c) => `Bot ${c}`);

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createSession(settings?: Partial<SessionSettings>): { code: string; hostId: string } {
  pruneExpired();
  const code = generateCode();
  const hostId = generateId();

  const session: Session = {
    code,
    hostId,
    status: "lobby",
    players: [],
    characters: [],
    votes: [],
    currentTask: 0,
    createdAt: Date.now(),
    settings: {
      maxPlayers: settings?.maxPlayers ?? 12,
      creationTimerMinutes: settings?.creationTimerMinutes ?? 0,
      allowSelfVote: settings?.allowSelfVote ?? false,
      revealScoresDuring: settings?.revealScoresDuring ?? false,
    },
  };

  sessions.set(code, session);
  return { code, hostId };
}

export function getSession(code: string): Session | null {
  pruneExpired();
  return sessions.get(code.toUpperCase()) || null;
}

export function joinSession(code: string, playerName: string): { playerId: string } | null {
  const session = getSession(code);
  if (!session) return null;
  if (session.status !== "lobby") return null;
  if (session.players.length >= session.settings.maxPlayers) return null;

  const playerId = generateId();
  const player: Player = {
    id: playerId,
    name: playerName,
    joinedAt: Date.now(),
    hasSubmittedCharacter: false,
    hasVoted: {},
  };

  session.players.push(player);
  return { playerId };
}

export function submitCharacter(
  code: string,
  playerId: string,
  character: Omit<CharacterSheet, "id">
): boolean {
  const session = getSession(code);
  if (!session) return false;
  if (session.status !== "creating") return false;

  const player = session.players.find((p) => p.id === playerId);
  if (!player) return false;
  if (player.hasSubmittedCharacter) return false;

  const existingIndex = session.characters.findIndex((c) => c.playerId === playerId);
  if (existingIndex >= 0) return false;

  const charWithAudition: CharacterWithAudition = {
    ...character,
    id: generateId(),
    playerId,
    botLabel: "",
    responses: {} as Record<TaskType, string>,
  };

  session.characters.push(charWithAudition);
  player.hasSubmittedCharacter = true;
  return true;
}

export function advancePhase(code: string, hostId: string): Session | null {
  const session = getSession(code);
  if (!session) return null;
  if (session.hostId !== hostId) return null;

  switch (session.status) {
    case "lobby":
      if (session.players.length < 2) return null;
      session.status = "creating";
      break;
    case "creating":
      assignBotLabels(session);
      session.status = "auditioning";
      break;
    case "auditioning":
      session.status = "presenting";
      session.currentTask = 0;
      break;
    case "presenting":
      session.status = "voting";
      break;
    case "voting": {
      const nextTask = session.currentTask + 1;
      if (nextTask >= 6) {
        session.status = "results";
      } else {
        session.currentTask = nextTask;
        session.status = "presenting";
      }
      break;
    }
    default:
      return null;
  }

  return session;
}

function assignBotLabels(session: Session) {
  const labels = shuffleArray(BOT_LABELS.slice(0, session.characters.length));
  session.characters.forEach((c, i) => {
    c.botLabel = labels[i];
  });
}

export function submitApprovals(
  code: string,
  playerId: string,
  taskIndex: number,
  approvals: Record<string, boolean>
): boolean {
  const session = getSession(code);
  if (!session) return false;
  if (session.status !== "voting") return false;
  if (taskIndex !== session.currentTask) return false;

  const player = session.players.find((p) => p.id === playerId);
  if (!player) return false;
  if (player.hasVoted[taskIndex]) return false;

  for (const [botLabel, approval] of Object.entries(approvals)) {
    const isSelf = session.characters.find(
      (c) => c.playerId === playerId && c.botLabel === botLabel
    );
    if (isSelf && !session.settings.allowSelfVote) continue;

    const validLabel = session.characters.some((c) => c.botLabel === botLabel);
    if (!validLabel) continue;

    session.votes.push({ playerId, taskIndex, botLabel, approval });
  }

  player.hasVoted[taskIndex] = true;
  return true;
}

export function setCharacterResponses(
  code: string,
  playerId: string,
  responses: Record<TaskType, string>
) {
  const session = getSession(code);
  if (!session) return;
  const char = session.characters.find((c) => c.playerId === playerId);
  if (char) {
    char.responses = responses;
  }
}

export function setCharacterScore(
  code: string,
  playerId: string,
  score: import("./types").CoherenceScore
) {
  const session = getSession(code);
  if (!session) return;
  const char = session.characters.find((c) => c.playerId === playerId);
  if (char) {
    char.coherenceScore = score;
  }
}

export function updateAuditionProgress(code: string, completed: number, total: number) {
  const session = getSession(code);
  if (session) {
    session.auditionProgress = { completed, total };
  }
}

export function updateSessionStatus(code: string, status: Session["status"]) {
  const session = getSession(code);
  if (session) {
    session.status = status;
  }
}
