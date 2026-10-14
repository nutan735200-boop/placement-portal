/**
 * Research-ready evaluation utilities for the campus placement system.
 *
 * This module implements metrics expected in a real ranking study:
 * - Precision@k, Recall@k
 * - NDCG@k
 * - MAP / Average Precision
 * - Inter-rater agreement (simple agreement + Cohen-style agreement proxy)
 * - Baseline comparison wrappers
 * - Ablation summary helpers
 *
 * It is intentionally framework-free so it can run in Node.js without
 * extra ML dependencies.
 */

function toSet(values) {
  return new Set((values || []).filter(Boolean));
}

function safeDivide(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function precisionAtK(ranking, relevantIds, k) {
  const topK = (ranking || []).slice(0, k);
  const relevantSet = toSet(relevantIds);
  const hits = topK.filter(id => relevantSet.has(id)).length;
  return safeDivide(hits, topK.length || 1);
}

function recallAtK(ranking, relevantIds, k) {
  const topK = (ranking || []).slice(0, k);
  const relevantSet = toSet(relevantIds);
  const hits = topK.filter(id => relevantSet.has(id)).length;
  return safeDivide(hits, relevantSet.size || 1);
}

function dcgAtK(ranking, relevanceMap, k) {
  let score = 0;
  const topK = (ranking || []).slice(0, k);

  topK.forEach((item, index) => {
    const rel = relevanceMap[item] || 0;
    const rank = index + 1;
    score += rel / Math.log2(rank + 1);
  });

  return score;
}

function idealDcgAtK(relevanceValues, k) {
  const values = [...(relevanceValues || [])].sort((a, b) => b - a);
  let score = 0;
  values.slice(0, k).forEach((value, index) => {
    const rank = index + 1;
    score += value / Math.log2(rank + 1);
  });
  return score;
}

function ndcgAtK(ranking, relevanceMap, k) {
  const actual = dcgAtK(ranking, relevanceMap, k);
  const idealValues = Object.values(relevanceMap || {});
  const ideal = idealDcgAtK(idealValues, k);
  return safeDivide(actual, ideal);
}

function averagePrecision(ranking, relevantIds) {
  const relevantSet = toSet(relevantIds);
  let precisionSum = 0;
  let hits = 0;

  for (let i = 0; i < ranking.length; i += 1) {
    const item = ranking[i];
    if (relevantSet.has(item)) {
      hits += 1;
      precisionSum += hits / (i + 1);
    }
  }

  return safeDivide(precisionSum, relevantSet.size || 1);
}

function meanAveragePrecision(allRankings, allRelevantIds) {
  if (!allRankings || allRankings.length === 0) return 0;
  const apValues = allRankings.map((ranking, idx) => averagePrecision(ranking, allRelevantIds[idx] || []));
  return apValues.reduce((sum, value) => sum + value, 0) / apValues.length;
}

function computeInterRaterAgreement(raterA, raterB) {
  if (!raterA || !raterB || raterA.length !== raterB.length) {
    return {
      agreement: 0,
      count: 0,
      note: 'Requires aligned arrays of equal length.'
    };
  }

  let same = 0;
  for (let i = 0; i < raterA.length; i += 1) {
    if (raterA[i] === raterB[i]) same += 1;
  }

  const agreement = safeDivide(same, raterA.length) * 100;

  return {
    agreement: agreement,
    count: raterA.length,
    note: 'Simple agreement percentage across raters.'
  };
}

function cohenKappaForBinary(raterA, raterB) {
  if (!raterA || !raterB || raterA.length !== raterB.length) {
    return { kappa: 0, note: 'Requires aligned arrays of equal length.' };
  }

  const n = raterA.length;
  let agreement = 0;
  let pa = 0;
  let pb = 0;

  for (let i = 0; i < n; i += 1) {
    if (raterA[i] === raterB[i]) agreement += 1;
    if (raterA[i] === 1) pa += 1;
    if (raterB[i] === 1) pb += 1;
  }

  const observed = agreement / n;
  const expected = (pa / n) * (pb / n) + ((n - pa) / n) * ((n - pb) / n);
  const kappa = expected === 1 ? 0 : (observed - expected) / (1 - expected);

  return {
    kappa: Number.isFinite(kappa) ? kappa : 0,
    note: 'Binary Cohen-style agreement proxy.'
  };
}

function buildRelevanceMap(ranking, groundTruthById) {
  const map = {};
  ranking.forEach((id) => {
    map[id] = groundTruthById[id] || 0;
  });
  return map;
}

function compareBaselines({ systemRanking, baselines, groundTruthById, k = 10 }) {
  const relevanceMap = buildRelevanceMap(systemRanking, groundTruthById);
  const result = {};

  Object.entries(baselines || {}).forEach(([name, ranking]) => {
    const map = buildRelevanceMap(ranking, groundTruthById);
    result[name] = {
      precisionAtK: precisionAtK(ranking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0), k),
      recallAtK: recallAtK(ranking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0), k),
      ndcgAtK: ndcgAtK(ranking, map, k),
      averagePrecision: averagePrecision(ranking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0))
    };
  });

  result.system = {
    precisionAtK: precisionAtK(systemRanking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0), k),
    recallAtK: recallAtK(systemRanking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0), k),
    ndcgAtK: ndcgAtK(systemRanking, relevanceMap, k),
    averagePrecision: averagePrecision(systemRanking, Object.keys(groundTruthById).filter(id => groundTruthById[id] > 0))
  };

  return result;
}

function ablationSummary(resultsByVariant) {
  return Object.entries(resultsByVariant).map(([variant, metrics]) => ({
    variant,
    ndcgAt10: metrics.ndcgAt10 || 0,
    map: metrics.map || 0,
    precisionAt10: metrics.precisionAt10 || 0,
    recallAt10: metrics.recallAt10 || 0
  }));
}

function sampleResearchRun() {
  const candidates = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
  const relevant = ['c2', 'c4', 'c6'];
  const systemRanking = ['c2', 'c5', 'c4', 'c1', 'c6', 'c7', 'c3', 'c8'];

  const groundTruthById = {};
  candidates.forEach((id) => {
    groundTruthById[id] = relevant.includes(id) ? 3 : 0;
  });

  const baselines = {
    bm25: ['c6', 'c4', 'c1', 'c2', 'c5', 'c8', 'c3', 'c7'],
    tfidf: ['c5', 'c1', 'c2', 'c7', 'c3', 'c4', 'c6', 'c8'],
    keyword: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
  };

  const comparison = compareBaselines({
    systemRanking,
    baselines,
    groundTruthById,
    k: 5
  });

  return {
    system: comparison.system,
    baselines: comparison.bm25,
    sampleMetrics: {
      precisionAt5: precisionAtK(systemRanking, relevant, 5),
      recallAt5: recallAtK(systemRanking, relevant, 5),
      ndcgAt5: ndcgAtK(systemRanking, buildRelevanceMap(systemRanking, groundTruthById), 5),
      averagePrecision: averagePrecision(systemRanking, relevant)
    },
    interRaterAgreement: computeInterRaterAgreement([1, 0, 1, 1, 0], [1, 0, 1, 0, 1]),
    kappa: cohenKappaForBinary([1, 0, 1, 1, 0], [1, 0, 1, 0, 1])
  };
}

if (require.main === module) {
  console.log(JSON.stringify(sampleResearchRun(), null, 2));
}

module.exports = {
  precisionAtK,
  recallAtK,
  dcgAtK,
  ndcgAtK,
  averagePrecision,
  meanAveragePrecision,
  computeInterRaterAgreement,
  cohenKappaForBinary,
  compareBaselines,
  ablationSummary,
  sampleResearchRun
};
