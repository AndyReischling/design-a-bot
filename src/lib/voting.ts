import type { Session, FinalRanking } from "./types";
import { detectAwards } from "./awards";

export function computeAudienceScores(session: Session): void {
  for (const char of session.characters) {
    const votesForChar = session.votes.filter(
      (v) => v.characterName === char.name
    );
    const yesVotes = votesForChar.filter((v) => v.approval).length;
    const totalVotes = votesForChar.length;
    const pct = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

    char.audienceScore = {
      yesVotes,
      totalVotes,
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
    const r = rankings.find((rk) => rk.characterName === award.characterName);
    if (r) r.awards.push(award.award);
  }

  return rankings;
}

export function getVotersCount(session: Session): number {
  return session.players.filter((p) => p.hasVoted[0]).length;
}
