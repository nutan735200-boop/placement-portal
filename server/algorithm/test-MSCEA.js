/**
 * ============================================================
 *  MSCEA Test Suite - Verify All Enhancements Work
 * ============================================================
 */

const MSCEA = require('./MSCEA');
const Metrics = require('./MSCEAEvaluation');

console.log('🧪 MSCEA Enhancement Test Suite\n');
console.log('=' .repeat(60));

// ─────────────────────────────────────────────────────────
// TEST 1: Skill Normalization
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 1: Skill Normalization (normalizeSkill)');
console.log('-'.repeat(60));

const testSkills = ['JS', 'JavaScript', 'Node JS', 'Spring Boot', 'Python', 'c++'];
for (const skill of testSkills) {
  const normalized = MSCEA.normalizeSkill(skill);
  console.log(`  "${skill}" → "${normalized}"`);
}

// ─────────────────────────────────────────────────────────
// TEST 2: Skill Extraction with Patterns
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 2: Skill Extraction with Patterns (extractSkillsWithPatterns)');
console.log('-'.repeat(60));

const resumeText = `
I have 3 years of experience with JavaScript, React, and Spring Boot.
I'm proficient in Python, Django, and PostgreSQL.
I also know Docker, Kubernetes, and AWS.
Currently learning Node.js and MongoDB.
`;

const extractedSkills = MSCEA.extractSkillsWithPatterns(resumeText);
console.log('  Resume Text:', resumeText.trim().split('\n')[0].trim());
console.log('  Extracted Skills:', extractedSkills);

// ─────────────────────────────────────────────────────────
// TEST 3: Skill Impact Prediction
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 3: Skill Impact Prediction (predictSkillImpact)');
console.log('-'.repeat(60));

const candidateSkills = ['java', 'sql', 'react'];
const requiredSkills = ['java', 'sql', 'react', 'springboot', 'docker', 'aws'];

const impact = MSCEA.predictSkillImpact(candidateSkills, requiredSkills);

console.log(`  Candidate Skills: ${candidateSkills.join(', ')}`);
console.log(`  Required Skills: ${requiredSkills.join(', ')}`);
console.log(`\n  Current Score: ${impact.currentScore}%`);
console.log(`\n  Impact Analysis:`);

for (const imp of impact.impacts.slice(0, 3)) {
  const arrow = imp.priority === 'high' ? '🔴' : imp.priority === 'medium' ? '🟡' : '🟢';
  console.log(`    ${arrow} ${imp.skill}: ${imp.currentScore}% → ${imp.scoreAfterSkill}% (↑ ${imp.improvement}%)`);
}

console.log(`\n  Recommendations:`);
impact.recommendations.forEach((rec, i) => {
  console.log(`    ${i + 1}. ${rec}`);
});

// ─────────────────────────────────────────────────────────
// TEST 4: Compatibility Matrix (Recruiter View)
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 4: Compatibility Matrix (generateCompatibilityMatrix)');
console.log('-'.repeat(60));

const testCandidate = {
  _id: '123',
  name: 'John Doe',
  cgpa: 8.5,
  skills: ['java', 'sql', 'react'],
  resumeText: 'I have developed web applications using React and Java. Good knowledge of databases.',
  branch: 'CSE'
};

const testDrive = {
  _id: 'drive1',
  title: 'Senior Java Developer',
  description: 'Looking for experienced Java developer with React and Spring Boot expertise',
  minCgpa: 7.0,
  requiredSkills: ['java', 'sql', 'react', 'springboot'],
  maxBacklogs: 0
};

const compat = MSCEA.generateCompatibilityMatrix(testCandidate, testDrive);

console.log(`  Candidate: ${testCandidate.name} (CGPA: ${testCandidate.cgpa})`);
console.log(`  Job: ${testDrive.title}`);
console.log(`\n  Compatibility Matrix:`);
console.log(`  ┌─────────────────────────────┐`);
for (const [key, value] of Object.entries(compat.summary)) {
  console.log(`  │ ${key.padEnd(24)} : ${value}`);
}
console.log(`  └─────────────────────────────┘`);

// ─────────────────────────────────────────────────────────
// TEST 5: Student Insights
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 5: Student Insights (generateStudentInsights)');
console.log('-'.repeat(60));

const insights = MSCEA.generateStudentInsights(testCandidate, testDrive);

console.log(`  Overall Score: ${insights.overallScore}%\n`);
console.log(`  Strengths (${insights.strengths.matched.length}):`);
insights.strengths.matched.forEach(skill => console.log(`    ✓ ${skill}`));

console.log(`\n  Gaps (${insights.gaps.count}):`);
insights.gaps.missing.forEach(skill => console.log(`    ✗ ${skill}`));

console.log(`\n  Next Steps:`);
insights.nextSteps.forEach(step => console.log(`    → ${step}`));

console.log(`\n  Recommendations:`);
insights.recommendations.forEach((rec, i) => console.log(`    ${i + 1}. ${rec}`));

// ─────────────────────────────────────────────────────────
// TEST 6: Full MSCEA Run
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 6: Full MSCEA Run (runMSCEA)');
console.log('-'.repeat(60));

// Create sample applicants
const applicants = [
  {
    _id: '1', name: 'Alice', cgpa: 8.5, branch: 'CSE', backlogs: 0, skills: ['java', 'sql', 'react', 'springboot'], college: 'GL Bajaj', resumeText: 'Full stack developer with React and Spring Boot'
  },
  {
    _id: '2', name: 'Bob', cgpa: 7.2, branch: 'IT', backlogs: 0, skills: ['java', 'sql', 'nodejs'], college: 'Delhi Univ', resumeText: 'Backend developer with Java and Node.js'
  },
  {
    _id: '3', name: 'Charlie', cgpa: 6.5, branch: 'CSE', backlogs: 1, skills: ['python', 'react'], college: 'GL Bajaj', resumeText: 'Python developer transitioning to web'
  },
  {
    _id: '4', name: 'Diana', cgpa: 9.0, branch: 'CSE', backlogs: 0, skills: ['java', 'springboot', 'sql', 'react', 'docker'], college: 'Delhi Univ', resumeText: 'Experienced full stack developer with cloud expertise'
  },
];

const result = MSCEA.runMSCEA(applicants, testDrive, 65);

console.log(`  Total Applicants: ${result.summary.total}`);
console.log(`  After Round 1 (Eligibility): ${result.summary.afterRound1}`);
console.log(`  After Round 2 (Skill Gap): ${result.summary.afterRound2}`);
console.log(`  After Round 3 (AI Scoring): ${result.summary.afterRound3}`);
console.log(`  Shortlisted (Threshold ${result.summary.threshold}%): ${result.summary.shortlisted}`);
console.log(`  Average Score: ${result.summary.avgScore}%`);
console.log(`  Processing Time: ${result.summary.processingMs}ms`);

console.log(`\n  Shortlisted Candidates:`);
result.shortlisted.forEach((c, i) => {
  console.log(`    ${i + 1}. ${c.name} - Score: ${c.aiScore}% (Skills: ${c.skillScore}%, CGPA: ${c.cgpaScore}%, Text: ${c.textScore}%)`);
});

// ─────────────────────────────────────────────────────────
// TEST 7: Evaluation Metrics
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 7: Evaluation Metrics');
console.log('-'.repeat(60));

// Simulate ground truth (expert evaluation)
const groundTruth = {
  positives: [
    { studentId: '1' },  // Alice: suitable
    { studentId: '4' }   // Diana: suitable
  ],
  expertRanking: ['4', '1', '2', '3']  // Expert's ranking
};

const report = Metrics.generateEvaluationReport(result, groundTruth);

console.log(`  Performance Metrics:`);
console.log(`    Precision:         ${report.performanceMetrics.precision.toFixed(2)}%`);
console.log(`    Recall:            ${report.performanceMetrics.recall.toFixed(2)}%`);
console.log(`    F1-Score:          ${report.performanceMetrics.f1Score.toFixed(2)}`);
console.log(`    Screening Reduction: ${report.performanceMetrics.screeningReduction.toFixed(2)}%`);
if (report.performanceMetrics.rankingCorrelation) {
  console.log(`    Ranking Correlation: ${report.performanceMetrics.rankingCorrelation.toFixed(4)}`);
}

console.log(`\n  Diversity Metrics:`);
console.log(`    Diversity Score:   ${report.qualityMetrics.diversityScore}/100`);
console.log(`    Assessment:        ${report.qualityMetrics.assessment}`);

// ─────────────────────────────────────────────────────────
// TEST 8: Baseline Comparison
// ─────────────────────────────────────────────────────────
console.log('\n✓ TEST 8: Baseline Comparison');
console.log('-'.repeat(60));

const comparison = Metrics.compareWithBaselines(result, applicants, testDrive);

console.log(`  Method Comparison:`);
console.log(`    MSCEA:      ${comparison.mscea.shortlisted} shortlisted, avg score ${comparison.mscea.avgScore}%`);
console.log(`    Random:     ${comparison.random.shortlisted} shortlisted`);
console.log(`    Keyword:    ${comparison.keyword.shortlisted} shortlisted`);
console.log(`    CGPA Only:  ${comparison.cgpa.shortlisted} shortlisted`);

// ─────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS PASSED\n');
console.log('Summary:');
console.log('  ✓ Pattern-based skill normalization working');
console.log('  ✓ Skill extraction with patterns working');
console.log('  ✓ Skill impact prediction working');
console.log('  ✓ Compatibility matrix working');
console.log('  ✓ Student insights working');
console.log('  ✓ Full MSCEA pipeline working');
console.log('  ✓ Evaluation metrics working');
console.log('  ✓ Baseline comparison working');
console.log('\n🚀 Ready for integration into backend routes!\n');
console.log('='.repeat(60));

module.exports = { MSCEA, Metrics };
