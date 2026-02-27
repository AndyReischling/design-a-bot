import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync } from "fs";
import { join } from "path";
import type { Session, SessionSettings, Player, CharacterSheet, CharacterWithAudition, Vote, TaskType } from "./types";

const SESSION_DIR = join("/tmp", "bot-idol-sessions");
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BOT_LABELS = "ABCDEFGHIJKLMNOPQRST".split("").map((c) => `Bot ${c}`);

function ensureDir() {
  if (!existsSync(SESSION_DIR)) {
    mkdirSync(SESSION_DIR, { recursive: true });
  }
}

function sessionPath(code: string): string {
  return join(SESSION_DIR, `${code.toUpperCase()}.json`);
}

function readSession(code: string): Session | null {
  const p = sessionPath(code);
  if (!existsSync(p)) return null;
  try {
    const raw = readFileSync(p, "utf-8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function writeSession(session: Session): void {
  ensureDir();
  writeFileSync(sessionPath(session.code), JSON.stringify(session), "utf-8");
}

function generateCode(): string {
  ensureDir();
  const existing = new Set(
    readdirSync(SESSION_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  );
  let code: string;
  do {
    code = Array.from({ length: 4 }, () =>
      SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
    ).join("");
  } while (existing.has(code));
  return code;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pruneExpired() {
  ensureDir();
  const now = Date.now();
  try {
    for (const file of readdirSync(SESSION_DIR)) {
      const p = join(SESSION_DIR, file);
      try {
        const stat = statSync(p);
        if (now - stat.mtimeMs > SESSION_TTL_MS) {
          unlinkSync(p);
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}

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

  writeSession(session);
  return { code, hostId };
}

export function getSession(code: string): Session | null {
  return readSession(code.toUpperCase());
}

function saveSession(session: Session) {
  writeSession(session);
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
  saveSession(session);
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
  saveSession(session);
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

  saveSession(session);
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
  saveSession(session);
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
    saveSession(session);
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
    saveSession(session);
  }
}

export function updateAuditionProgress(code: string, completed: number, total: number) {
  const session = getSession(code);
  if (session) {
    session.auditionProgress = { completed, total };
    saveSession(session);
  }
}

export function updateSessionStatus(code: string, status: Session["status"]) {
  const session = getSession(code);
  if (session) {
    session.status = status;
    saveSession(session);
  }
}
