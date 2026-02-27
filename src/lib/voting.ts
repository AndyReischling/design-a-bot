import type { Session, AudienceScore, FinalRanking, Award } from "./types";
import { detectAwards } from "./awards";

export function computeAudienceScores(session: Session): void {
  const totalVoters = session.players.length;

  for (const char of session.characters) {
    const votesPerTask: number[] = [];

    for (let t = 0; t < 6; t++) {
      const count = session.votes.filter(
        (v) => v.taskIndex === t && v.votedForBotLabel === char.botLabel
      ).length;
      votesPerTask.push(count);
    }

    const totalVotes = votesPerTask.reduce((a, b) => a + b, 0);
    const maxPossible = totalVoters * 6;

    char.audienceScore = {
      totalVotes,
      votesPerTask,
      percentageOfVotes: maxPossible > 0 ? Math.round((totalVotes / maxPossible) * 100) : 0,
    };
  }
}

export function computeRankings(session: Session): FinalRanking[] {
  computeAudienceScores(session);

  const chars = session.characters.filter((c) => c.coherenceScore);

  const byCoherence = [...chars].sort(
    (a, b) => (b.coherenceScore?.overall ?? 0) - (a.coherenceScore?.overall ?? 0)
  );
  const byAudience = [...chars].sort(
    (a, b) => (b.audienceScore?.totalVotes ?? 0) - (a.audienceScore?.totalVotes ?? 0)
  );

  const coherenceRankMap = new Map<string, number>();
  byCoherence.forEach((c, i) => coherenceRankMap.set(c.botLabel, i + 1));

  const audienceRankMap = new Map<string, number>();
  byAudience.forEach((c, i) => audienceRankMap.set(c.botLabel, i + 1));

  const rankings: FinalRanking[] = chars.map((c) => {
    const player = session.players.find((p) => p.id === c.playerId);
    const cRank = coherenceRankMap.get(c.botLabel) ?? chars.length;
    const aRank = audienceRankMap.get(c.botLabel) ?? chars.length;

    return {
      botLabel: c.botLabel,
      characterName: c.name,
      playerName: player?.name ?? "Unknown",
      coherenceScore: c.coherenceScore?.overall ?? 0,
      coherenceRank: cRank,
      audienceVotePercent: c.audienceScore?.percentageOfVotes ?? 0,
      audienceRank: aRank,
      combinedRank: (cRank + aRank) / 2,
      awards: [],
    };
  });

  rankings.sort((a, b) => {
    if (a.combinedRank !== b.combinedRank) return a.combinedRank - b.combinedRank;
    return a.audienceRank - b.audienceRank;
  });

  const awards = detectAwards(session, rankings);
  for (const award of awards) {
    const r = rankings.find((rk) => rk.botLabel === award.botLabel);
    if (r) r.awards.push(award.award);
  }

  return rankings;
}

export function getVoteCountsForTask(
  session: Session,
  taskIndex: number
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const char of session.characters) {
    counts[char.botLabel] = 0;
  }
  for (const vote of session.votes) {
    if (vote.taskIndex === taskIndex) {
      counts[vote.votedForBotLabel] = (counts[vote.votedForBotLabel] || 0) + 1;
    }
  }
  return counts;
}

export function getVotesSubmittedForTask(session: Session, taskIndex: number): number {
  return session.votes.filter((v) => v.taskIndex === taskIndex).length;
}
