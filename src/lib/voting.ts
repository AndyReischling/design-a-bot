import type { Session, FinalRanking } from "./types";
import { detectAwards } from "./awards";

export function computeAudienceScores(session: Session): void {
  for (const char of session.characters) {
    const yesPerTask: number[] = [];
    const totalPerTask: number[] = [];

    for (let t = 0; t < 6; t++) {
      const votesForBot = session.votes.filter(
        (v) => v.taskIndex === t && v.botLabel === char.botLabel
      );
      totalPerTask.push(votesForBot.length);
      yesPerTask.push(votesForBot.filter((v) => v.approval).length);
    }

    const yesVotes = yesPerTask.reduce((a, b) => a + b, 0);
    const totalVotes = totalPerTask.reduce((a, b) => a + b, 0);
    const pct = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

    char.audienceScore = {
      yesVotes,
      totalVotes,
      yesPerTask,
      totalPerTask,
      points: pct,
    };
  }
}

export function computeRankings(session: Session): FinalRanking[] {
  computeAudienceScores(session);

  const chars = session.characters.filter((c) => c.coherenceScore);

  const rankings: FinalRanking[] = chars.map((c) => {
    const player = session.players.find((p) => p.id === c.playerId);
    const coherence = c.coherenceScore?.overall ?? 0;
    const audience = c.audienceScore?.points ?? 0;

    return {
      botLabel: c.botLabel,
      characterName: c.name,
      playerName: player?.name ?? "Unknown",
      coherenceScore: coherence,
      audiencePoints: audience,
      totalScore: coherence + audience,
      awards: [],
    };
  });

  rankings.sort((a, b) => b.totalScore - a.totalScore);

  const awards = detectAwards(session, rankings);
  for (const award of awards) {
    const r = rankings.find((rk) => rk.botLabel === award.botLabel);
    if (r) r.awards.push(award.award);
  }

  return rankings;
}

export function getApprovalCountsForTask(
  session: Session,
  taskIndex: number
): Record<string, { yes: number; total: number }> {
  const counts: Record<string, { yes: number; total: number }> = {};
  for (const char of session.characters) {
    counts[char.botLabel] = { yes: 0, total: 0 };
  }
  for (const vote of session.votes) {
    if (vote.taskIndex === taskIndex && counts[vote.botLabel]) {
      counts[vote.botLabel].total++;
      if (vote.approval) counts[vote.botLabel].yes++;
    }
  }
  return counts;
}

export function getVotesSubmittedForTask(session: Session, taskIndex: number): number {
  return session.players.filter((p) => p.hasVoted[taskIndex]).length;
}
