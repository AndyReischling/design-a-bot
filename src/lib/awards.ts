import type { Session, FinalRanking, Award } from "./types";

interface AwardAssignment {
  characterName: string;
  award: Award;
}

export function detectAwards(
  session: Session,
  rankings: FinalRanking[]
): AwardAssignment[] {
  const results: AwardAssignment[] = [];
  if (rankings.length < 2) return results;

  const topCoherence = [...rankings].sort((a, b) => b.coherenceScore - a.coherenceScore)[0];
  const topAudience = [...rankings].sort((a, b) => b.audiencePoints - a.audiencePoints)[0];

  if (topCoherence.characterName === topAudience.characterName) {
    results.push({
      characterName: topCoherence.characterName,
      award: {
        id: "unanimous",
        label: "Unanimous",
        description: "The machine and the crowd agree",
      },
    });
  } else {
    results.push({
      characterName: topCoherence.characterName,
      award: {
        id: "most-coherent",
        label: "Most Coherent",
        description: `Highest AI coherence score: ${topCoherence.coherenceScore}/30`,
      },
    });
    results.push({
      characterName: topAudience.characterName,
      award: {
        id: "audience-favorite",
        label: "Audience Favorite",
        description: `${topAudience.audiencePoints}% approval rating`,
      },
    });
  }

  const byCoherence = [...rankings].sort((a, b) => b.coherenceScore - a.coherenceScore);
  const byAudienceSorted = [...rankings].sort((a, b) => b.audiencePoints - a.audiencePoints);
  const withGap = rankings.map((r) => {
    const cRank = byCoherence.findIndex((x) => x.characterName === r.characterName) + 1;
    const aRank = byAudienceSorted.findIndex((x) => x.characterName === r.characterName) + 1;
    return { ...r, gap: Math.abs(cRank - aRank), cRank, aRank };
  });
  const biggestGap = withGap.sort((a, b) => b.gap - a.gap)[0];
  if (biggestGap.gap >= 2) {
    const lovedByHumans = biggestGap.aRank < biggestGap.cRank;
    results.push({
      characterName: biggestGap.characterName,
      award: {
        id: "biggest-gap",
        label: "Biggest Gap",
        description: lovedByHumans
          ? "Loved by humans, doubted by the machine"
          : "The machine's favorite, ignored by the crowd",
      },
    });
  }

  const bottomAudience = [...rankings].sort((a, b) => a.audiencePoints - b.audiencePoints)[0];
  if (bottomAudience.coherenceScore >= 20) {
    results.push({
      characterName: bottomAudience.characterName,
      award: {
        id: "hidden-gem",
        label: "Hidden Gem",
        description: "High coherence, low audience love -- misunderstood genius",
      },
    });
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.characterName}:${r.award.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
