/**
 * ============================================================
 *  MSCEA Evaluation Metrics & Experiment Framework
 *  Designed for Research-Oriented Assessment
 * ============================================================
 *  Metrics: Precision, Recall, F1-Score, Screening Reduction,
 *           Ranking Quality, Diversity Balance
 * ============================================================
 */

// ── Evaluation Metrics ──────────────────────────────────────
/**
 * Calculate Precision: % of candidates identified as suitable who were actually suitable
 * Requires ground truth (expert/recruiter rankings)
 */
function calculatePrecision(predictedShortlist, groundTruthPositives) {
  if (predictedShortlist.length === 0) return 0;
  
  const truePositives = predictedShortlist.filter(candidate =>
    groundTruthPositives.some(gt => gt.studentId === candidate.studentId)
  ).length;
  
  return (truePositives / predictedShortlist.length) * 100;
}

/**
 * Calculate Recall: % of suitable candidates successfully identified by system
 */
function calculateRecall(predictedShortlist, groundTruthPositives) {
  if (groundTruthPositives.length === 0) return 0;
  
  const truePositives = predictedShortlist.filter(candidate =>
    groundTruthPositives.some(gt => gt.studentId === candidate.studentId)
  ).length;
  
  return (truePositives / groundTruthPositives.length) * 100;
}

/**
 * Calculate F1-Score: Harmonic mean of precision and recall
 * Best for imbalanced datasets
 */
function calculateF1Score(precision, recall) {
  if (precision + recall === 0) return 0;
  return (2 * (precision * recall)) / (precision + recall);
}

/**
 * Calculate Screening Reduction: How much manual review is reduced
 * Formula: (Total Applicants - Candidates Requiring Detailed Review) / Total Applicants * 100
 */
function calculateScreeningReduction(totalApplicants, screened) {
  if (totalApplicants === 0) return 0;
  return ((totalApplicants - screened) / totalApplicants) * 100;
}

/**
 * Calculate Ranking Quality using Spearman's Rank Correlation
 * Compares system ranking against expert ranking
 * Returns value between -1 (perfect negative) and 1 (perfect positive)
 */
function calculateSpearmanCorrelation(systemRanking, expertRanking) {
  if (systemRanking.length !== expertRanking.length || systemRanking.length < 2) {
    return 0;
  }

  // Create position maps
  const systemPos = {};
  const expertPos = {};
  
  systemRanking.forEach((id, idx) => systemPos[id] = idx + 1);
  expertRanking.forEach((id, idx) => expertPos[id] = idx + 1);

  // Calculate differences squared
  let sumDiffSquared = 0;
  for (const id in systemPos) {
    if (expertPos[id]) {
      const diff = systemPos[id] - expertPos[id];
      sumDiffSquared += diff * diff;
    }
  }

  const n = Object.keys(systemPos).length;
  const correlation = 1 - ((6 * sumDiffSquared) / (n * (n * n - 1)));
  
  return Math.round(correlation * 10000) / 10000;
}

/**
 * Calculate Diversity Balance: Check if shortlist represents different colleges/branches
 * Returns: { diversityScore, collegeDistribution, branchDistribution }
 */
function calculateDiversityBalance(shortlist) {
  const colleges = {};
  const branches = {};
  let totalCount = shortlist.length;

  for (const candidate of shortlist) {
    const col = candidate.college || "Unknown";
    const br = candidate.branch || "Unknown";
    colleges[col] = (colleges[col] || 0) + 1;
    branches[br] = (branches[br] || 0) + 1;
  }

  // Shannon Entropy (measure of diversity)
  const calculateEntropy = (distribution, total) => {
    let entropy = 0;
    for (const count of Object.values(distribution)) {
      const prob = count / total;
      if (prob > 0) entropy -= prob * Math.log2(prob);
    }
    return entropy;
  };

  const collegeCount = Object.keys(colleges).length;
  const branchCount = Object.keys(branches).length;
  const collegeEntropy = calculateEntropy(colleges, totalCount);
  const branchEntropy = calculateEntropy(branches, totalCount);

  // Normalized diversity score (0-100)
  const maxCollegeEntropy = Math.log2(Math.min(collegeCount, 20));
  const maxBranchEntropy = Math.log2(Math.min(branchCount, 20));
  
  const diversityScore = Math.round(
    ((collegeEntropy / maxCollegeEntropy + branchEntropy / maxBranchEntropy) / 2) * 100
  );

  return {
    diversityScore: Math.min(diversityScore, 100),
    collegeDistribution: colleges,
    branchDistribution: branches,
    collegeCount,
    branchCount,
    assessment: diversityScore > 70 ? "High Diversity" : diversityScore > 40 ? "Moderate Diversity" : "Low Diversity"
  };
}

/**
 * Calculate Elimination Efficiency: How effective each round is
 * Returns breakdown of eliminations by round
 */
function calculateEliminationEfficiency(msciaResult) {
  const total = msciaResult.summary.total;
  const round1Elim = total - msciaResult.summary.afterRound1;
  const round2Elim = msciaResult.summary.afterRound1 - msciaResult.summary.afterRound2;
  const round3Elim = msciaResult.summary.afterRound2 - msciaResult.summary.afterRound3;
  const round4Elim = msciaResult.summary.afterRound3 - msciaResult.summary.shortlisted;

  return {
    round1: { eliminated: round1Elim, percentage: (round1Elim / total * 100).toFixed(2) + "%" },
    round2: { eliminated: round2Elim, percentage: (round2Elim / total * 100).toFixed(2) + "%" },
    round3: { eliminated: round3Elim, percentage: (round3Elim / total * 100).toFixed(2) + "%" },
    round4: { eliminated: round4Elim, percentage: (round4Elim / total * 100).toFixed(2) + "%" },
    totalEliminated: total - msciaResult.summary.shortlisted,
    summary: `R1: ${round1Elim}(${(round1Elim/total*100).toFixed(1)}%) | R2: ${round2Elim}(${(round2Elim/total*100).toFixed(1)}%) | R3: ${round3Elim}(${(round3Elim/total*100).toFixed(1)}%) | R4: ${round4Elim}(${(round4Elim/total*100).toFixed(1)}%)`
  };
}

/**
 * Generate comprehensive evaluation report
 * Requires: MSCEA output + ground truth + expert rankings
 */
function generateEvaluationReport(msciaResult, groundTruth) {
  const shortlist = msciaResult.shortlisted;
  const allCandidates = msciaResult.allCandidates;
  
  const precision = calculatePrecision(shortlist, groundTruth.positives || []);
  const recall = calculateRecall(shortlist, groundTruth.positives || []);
  const f1Score = calculateF1Score(precision, recall);
  
  const screeningReduction = calculateScreeningReduction(
    msciaResult.summary.total,
    msciaResult.summary.shortlisted
  );
  
  const diversityMetrics = calculateDiversityBalance(shortlist);
  const eliminationEfficiency = calculateEliminationEfficiency(msciaResult);
  
  const rankingCorrelation = groundTruth.expertRanking
    ? calculateSpearmanCorrelation(
        shortlist.map(c => c.studentId),
        groundTruth.expertRanking
      )
    : null;

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalApplicants: msciaResult.summary.total,
      shortlisted: msciaResult.summary.shortlisted,
      avgScore: msciaResult.summary.avgScore,
      processingTimeMs: msciaResult.summary.processingMs
    },
    performanceMetrics: {
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      f1Score: Math.round(f1Score * 100) / 100,
      screeningReduction: Math.round(screeningReduction * 100) / 100,
      rankingCorrelation: rankingCorrelation
    },
    qualityMetrics: diversityMetrics,
    processEfficiency: eliminationEfficiency,
    report: {
      precision: `${Math.round(precision * 100) / 100}% of shortlisted candidates were actually suitable`,
      recall: `${Math.round(recall * 100) / 100}% of suitable candidates were successfully identified`,
      f1: `F1-Score: ${Math.round(f1Score * 100) / 100}`,
      screening: `Manual screening reduced by ${Math.round(screeningReduction * 100) / 100}%`,
      diversity: `${diversityMetrics.assessment} (Score: ${diversityMetrics.diversityScore}/100)`,
      correlation: rankingCorrelation !== null 
        ? `Ranking correlation with experts: ${rankingCorrelation}` 
        : "Expert ranking not provided"
    }
  };
}

/**
 * Compare MSCEA with baseline methods
 * Baselines: 1) Random Selection, 2) Simple Keyword Matching, 3) CGPA-Only
 */
function compareWithBaselines(msciaResult, applicants, drive) {
  // Baseline 1: Random (no algorithm)
  const randomShortlist = applicants.sort(() => Math.random() - 0.5)
    .slice(0, msciaResult.shortlisted.length);

  // Baseline 2: Simple Keyword Matching (exact matches only, no graph)
  const keywordShortlist = applicants
    .map(a => {
      const exactMatches = (a.skills || []).filter(s => 
        (drive.requiredSkills || []).includes(s)
      ).length;
      return { ...a, matches: exactMatches };
    })
    .sort((a, b) => b.matches - a.matches)
    .slice(0, msciaResult.shortlisted.length)
    .map(a => ({ ...a, method: "keyword" }));

  // Baseline 3: CGPA Only
  const cgpaShortlist = applicants
    .sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
    .slice(0, msciaResult.shortlisted.length)
    .map(a => ({ ...a, method: "cgpa" }));

  return {
    mscea: { method: "MSCEA", shortlisted: msciaResult.shortlisted.length, avgScore: msciaResult.summary.avgScore },
    random: { method: "Random", shortlisted: randomShortlist.length, avgScore: 0 },
    keyword: { method: "Keyword Matching", shortlisted: keywordShortlist.length, avgScore: 0 },
    cgpa: { method: "CGPA Only", shortlisted: cgpaShortlist.length, avgScore: 0 },
    comparison: `MSCEA shortlisted ${msciaResult.shortlisted.length} candidates with avg score ${msciaResult.summary.avgScore}%`
  };
}

module.exports = {
  calculatePrecision,
  calculateRecall,
  calculateF1Score,
  calculateScreeningReduction,
  calculateSpearmanCorrelation,
  calculateDiversityBalance,
  calculateEliminationEfficiency,
  generateEvaluationReport,
  compareWithBaselines
};
