import type { Session, FinalRanking, Award } from "./types";

interface AwardAssignment {
  botLabel: string;
  award: Award;
}

export function detectAwards(
  session: Session,
  rankings: FinalRanking[]
): AwardAssignment[] {
  const results: AwardAssignment[] = [];
  if (rankings.length < 2) return results;

  // Most Coherent - highest AI score
  const topCoherence = [...rankings].sort((a, b) => b.coherenceScore - a.coherenceScore)[0];
  results.push({
    botLabel: topCoherence.botLabel,
    award: {
      id: "most-coherent",
      label: "Most Coherent",
      description: `Highest AI coherence score: ${topCoherence.coherenceScore}/30`,
    },
  });

  // Audience Favorite - highest audience points
  const topAudience = [...rankings].sort((a, b) => b.audiencePoints - a.audiencePoints)[0];
  results.push({
    botLabel: topAudience.botLabel,
    award: {
      id: "audience-favorite",
      label: "Audience Favorite",
      description: `${topAudience.audiencePoints}% approval rating`,
    },
  });

  // Unanimous - if same character wins both
  if (topCoherence.botLabel === topAudience.botLabel) {
    const existing = results.filter((r) => r.botLabel === topCoherence.botLabel);
    for (const e of existing) {
      if (e.award.id === "most-coherent" || e.award.id === "audience-favorite") {
        e.award = {
          id: "unanimous",
          label: "Unanimous",
          description: "The machine and the crowd agree",
        };
      }
    }
    // Remove duplicate
    const idx = results.findIndex(
      (r) => r.botLabel === topCoherence.botLabel && r.award.id !== "unanimous"
    );
    if (idx >= 0) results.splice(idx, 1);
  }

  // Biggest Gap - largest difference between coherence and audience rankings
  const byCoherence = [...rankings].sort((a, b) => b.coherenceScore - a.coherenceScore);
  const byAudience = [...rankings].sort((a, b) => b.audiencePoints - a.audiencePoints);
  const withGap = rankings.map((r) => {
    const cRank = byCoherence.findIndex((x) => x.botLabel === r.botLabel) + 1;
    const aRank = byAudience.findIndex((x) => x.botLabel === r.botLabel) + 1;
    return { ...r, gap: Math.abs(cRank - aRank), cRank, aRank };
  });
  const biggestGap = withGap.sort((a, b) => b.gap - a.gap)[0];
  if (biggestGap.gap >= 2) {
    const lovedByHumans = biggestGap.aRank < biggestGap.cRank;
    results.push({
      botLabel: biggestGap.botLabel,
      award: {
        id: "biggest-gap",
        label: "Biggest Gap",
        description: lovedByHumans
          ? "Loved by humans, doubted by the machine"
          : "The machine's favorite, ignored by the crowd",
      },
    });
  }

  // Scene Stealer - won the most individual task rounds (highest approval per task)
  const taskWins: Record<string, number> = {};
  for (let t = 0; t < 6; t++) {
    const approvalThisTask: Record<string, number> = {};
    for (const char of session.characters) {
      const votesForBot = session.votes.filter(
        (v) => v.taskIndex === t && v.botLabel === char.botLabel
      );
      const yesCount = votesForBot.filter((v) => v.approval).length;
      approvalThisTask[char.botLabel] = yesCount;
    }
    const maxYes = Math.max(...Object.values(approvalThisTask));
    if (maxYes > 0) {
      for (const [label, count] of Object.entries(approvalThisTask)) {
        if (count === maxYes) {
          taskWins[label] = (taskWins[label] || 0) + 1;
        }
      }
    }
  }
  const sceneStealerLabel = Object.entries(taskWins).sort((a, b) => b[1] - a[1])[0];
  if (sceneStealerLabel && sceneStealerLabel[1] >= 2) {
    results.push({
      botLabel: sceneStealerLabel[0],
      award: {
        id: "scene-stealer",
        label: "Scene Stealer",
        description: `Won ${sceneStealerLabel[1]} individual task rounds`,
      },
    });
  }

  // The Rock - lowest variance in approval across tasks
  const chars = session.characters.filter((c) => c.audienceScore);
  if (chars.length > 0) {
    const variances = chars.map((c) => {
      const ypt = c.audienceScore!.yesPerTask;
      const mean = ypt.reduce((a, b) => a + b, 0) / ypt.length;
      const variance = ypt.reduce((a, b) => a + (b - mean) ** 2, 0) / ypt.length;
      return { botLabel: c.botLabel, variance };
    });
    const rock = variances.sort((a, b) => a.variance - b.variance)[0];
    if (rock && variances.length > 2) {
      results.push({
        botLabel: rock.botLabel,
        award: {
          id: "the-rock",
          label: "The Rock",
          description: "Most consistent approval across all 6 tasks",
        },
      });
    }
  }

  // Comeback Kid - lowest approval in tasks 1-2, highest in tasks 5-6
  if (chars.length > 0) {
    const comebacks = chars.map((c) => {
      const ypt = c.audienceScore!.yesPerTask;
      const early = ypt[0] + ypt[1];
      const late = ypt[4] + ypt[5];
      return { botLabel: c.botLabel, swing: late - early, early, late };
    });
    const kid = comebacks.sort((a, b) => b.swing - a.swing)[0];
    if (kid && kid.swing > 0 && kid.early < kid.late) {
      results.push({
        botLabel: kid.botLabel,
        award: {
          id: "comeback-kid",
          label: "Comeback Kid",
          description: "Started quiet, ended strong",
        },
      });
    }
  }

  // Gloucester's Favorite - highest approval on task 6
  const task6Approval: Record<string, number> = {};
  for (const char of session.characters) {
    task6Approval[char.botLabel] = session.votes.filter(
      (v) => v.taskIndex === 5 && v.botLabel === char.botLabel && v.approval
    ).length;
  }
  const maxT6 = Math.max(...Object.values(task6Approval));
  if (maxT6 > 0) {
    const gloucesterFav = Object.entries(task6Approval).find(([, v]) => v === maxT6);
    if (gloucesterFav) {
      results.push({
        botLabel: gloucesterFav[0],
        award: {
          id: "gloucesters-favorite",
          label: "Gloucester's Favorite",
          description: "Highest approval on the Lear retelling",
        },
      });
    }
  }

  // Deduplicate by botLabel + award.id
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.botLabel}:${r.award.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
