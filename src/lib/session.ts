import { kv } from "@vercel/kv";
import type { Session, SessionSettings, Player, CharacterSheet, CharacterWithAudition, TaskType } from "./types";

const SESSION_TTL_S = 2 * 60 * 60; // 2 hours
const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BOT_LABELS = "ABCDEFGHIJKLMNOPQRST".split("").map((c) => `Bot ${c}`);

function sessionKey(code: string): string {
  return `session:${code.toUpperCase()}`;
}

async function readSession(code: string): Promise<Session | null> {
  const data = await kv.get<Session>(sessionKey(code));
  return data ?? null;
}

async function writeSession(session: Session): Promise<void> {
  await kv.set(sessionKey(session.code), session, { ex: SESSION_TTL_S });
}

async function generateCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  do {
    code = Array.from({ length: 4 }, () =>
      SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
    ).join("");
    const exists = await kv.exists(sessionKey(code));
    if (!exists) break;
    attempts++;
  } while (attempts < 20);
  return code;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function createSession(settings?: Partial<SessionSettings>): Promise<{ code: string; hostId: string }> {
  const code = await generateCode();
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

  await writeSession(session);
  return { code, hostId };
}

export async function getSession(code: string): Promise<Session | null> {
  return readSession(code.toUpperCase());
}

export async function joinSession(code: string, playerName: string): Promise<{ playerId: string } | null> {
  const session = await getSession(code);
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
  await writeSession(session);
  return { playerId };
}

export async function submitCharacter(
  code: string,
  playerId: string,
  character: Omit<CharacterSheet, "id">
): Promise<boolean> {
  const session = await getSession(code);
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
  await writeSession(session);
  return true;
}

export async function advancePhase(code: string, hostId: string): Promise<Session | null> {
  const session = await getSession(code);
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

  await writeSession(session);
  return session;
}

function assignBotLabels(session: Session) {
  const labels = shuffleArray(BOT_LABELS.slice(0, session.characters.length));
  session.characters.forEach((c, i) => {
    c.botLabel = labels[i];
  });
}

export async function submitApprovals(
  code: string,
  playerId: string,
  taskIndex: number,
  approvals: Record<string, boolean>
): Promise<boolean> {
  const session = await getSession(code);
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
  await writeSession(session);
  return true;
}

export async function setCharacterResponses(
  code: string,
  playerId: string,
  responses: Record<TaskType, string>
): Promise<void> {
  const session = await getSession(code);
  if (!session) return;
  const char = session.characters.find((c) => c.playerId === playerId);
  if (char) {
    char.responses = responses;
    await writeSession(session);
  }
}

export async function setCharacterScore(
  code: string,
  playerId: string,
  score: import("./types").CoherenceScore
): Promise<void> {
  const session = await getSession(code);
  if (!session) return;
  const char = session.characters.find((c) => c.playerId === playerId);
  if (char) {
    char.coherenceScore = score;
    await writeSession(session);
  }
}

export async function updateAuditionProgress(code: string, completed: number, total: number): Promise<void> {
  const session = await getSession(code);
  if (session) {
    session.auditionProgress = { completed, total };
    await writeSession(session);
  }
}

export async function updateSessionStatus(code: string, status: Session["status"]): Promise<void> {
  const session = await getSession(code);
  if (session) {
    session.status = status;
    await writeSession(session);
  }
}
