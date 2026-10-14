/**
 * ============================================================
 *  MSCEA — Multi-Stage Candidate Elimination Algorithm
 *  Designed & Implemented by: Nutan Kumari
 *  MCA Final Year Project — G.L. Bajaj Institute
 * ============================================================
 *  No ML library used — everything from scratch in Node.js
 * ============================================================
 */

// ── Skills Knowledge Base (200+ skills) ────────────────────
const SKILLS_KB = {
  programming:  ["python","java","javascript","typescript","c","c++","c#","php","ruby","go","kotlin","swift","r","scala","dart","rust","bash","shell","matlab"],
  web_frontend: ["html","css","react","angular","vue","nextjs","nuxtjs","bootstrap","tailwind","jquery","sass","redux","webpack","vite","svelte"],
  web_backend:  ["nodejs","node.js","express","django","flask","fastapi","spring","springboot","laravel","nestjs","restapi","graphql","microservices"],
  ml_ai:        ["machine learning","deep learning","nlp","computer vision","tensorflow","pytorch","keras","opencv","pandas","numpy","neural network","data science","statistics","regression","classification","clustering","bert","transformer","generative ai"],
  database:     ["mysql","postgresql","mongodb","redis","sqlite","oracle","cassandra","elasticsearch","dynamodb","firebase","sql","nosql","mariadb"],
  cloud_devops: ["aws","azure","gcp","docker","kubernetes","jenkins","github actions","terraform","ansible","linux","nginx","apache","devops","cicd","heroku","vercel","netlify"],
  tools:        ["git","github","gitlab","jira","postman","swagger","figma","vscode","jupyter","tableau","powerbi","excel"],
  mobile:       ["android","ios","react native","flutter","xamarin","ionic"]
};

// All skills flat — sorted longest first (match phrases before words)
const ALL_SKILLS = [];
for (const skills of Object.values(SKILLS_KB)) ALL_SKILLS.push(...skills);
ALL_SKILLS.sort((a, b) => b.length - a.length);

// ── Skill Pattern Dictionary (Normalization + Synonyms) ────
// Maps variations to canonical skill names
const SKILL_PATTERNS = {
  // Programming Languages
  "java":           ["java", "j2ee"],
  "javascript":     ["javascript", "js", "node js", "nodejs"],
  "python":         ["python", "py"],
  "typescript":     ["typescript", "ts"],
  "c++":            ["c++", "cpp"],
  "c#":             ["c#", "csharp"],
  "react":          ["react", "reactjs", "react.js"],
  "angular":        ["angular", "angularjs"],
  "vue":            ["vue", "vuejs", "vue.js"],
  "nodejs":         ["nodejs", "node.js", "node"],
  "express":        ["express", "expressjs"],
  "spring":         ["spring", "springmvc"],
  "springboot":     ["springboot", "spring boot"],
  "django":         ["django", "django rest"],
  "flask":          ["flask", "flask rest"],
  "mongodb":        ["mongodb", "mongo"],
  "mysql":          ["mysql", "my sql"],
  "postgresql":     ["postgresql", "postgres", "postgre"],
  "sql":            ["sql", "structured query language"],
  "docker":         ["docker", "dockerization"],
  "kubernetes":     ["kubernetes", "k8s"],
  "aws":            ["aws", "amazon web services"],
  "azure":          ["azure", "microsoft azure"],
  "gcp":            ["gcp", "google cloud"],
  "git":            ["git", "github", "gitlab", "version control"],
  "html":           ["html", "html5"],
  "css":            ["css", "css3"],
  "bootstrap":      ["bootstrap", "bootstrap framework"],
  "tailwind":       ["tailwind", "tailwindcss", "tailwind css"],
  "machine learning": ["machine learning", "ml", "deep learning"],
  "tensorflow":     ["tensorflow", "tf"],
  "pytorch":        ["pytorch", "torch"],
  "nlp":            ["nlp", "natural language processing"],
  "computer vision": ["computer vision", "cv", "image processing"],
};

// Skill Proximity Graph — related skills for partial credit
const SKILL_GRAPH = {
  "python":           ["django","flask","fastapi","pandas","numpy","machine learning"],
  "javascript":       ["react","nodejs","express","vue","angular","typescript"],
  "typescript":       ["react","nodejs","angular","nestjs","javascript"],
  "java":             ["spring","springboot","android","kotlin"],
  "react":            ["javascript","typescript","nextjs","redux","angular","vue"],
  "nodejs":           ["express","javascript","mongodb","nestjs"],
  "node.js":          ["express","javascript","mongodb","nestjs"],
  "django":           ["python","postgresql","restapi","flask"],
  "flask":            ["python","django","fastapi","restapi"],
  "machine learning": ["python","tensorflow","pytorch","numpy","pandas","data science"],
  "deep learning":    ["machine learning","tensorflow","pytorch","neural network"],
  "sql":              ["mysql","postgresql","oracle","sqlite","mariadb"],
  "mongodb":          ["nosql","nodejs","firebase"],
  "docker":           ["kubernetes","linux","devops","cicd","aws"],
  "aws":              ["docker","kubernetes","devops","gcp","azure"],
  "flutter":          ["dart","mobile","android","ios"],
  "c++":              ["c","java"],
  "angular":          ["javascript","typescript","react","vue"],
  "vue":              ["javascript","react","angular","nuxtjs"],
  "spring":           ["java","springboot","kotlin"],
  "tensorflow":       ["machine learning","deep learning","keras","pytorch"],
  "pytorch":          ["machine learning","deep learning","tensorflow","keras"],
};

// ── Pattern-Based Skill Normalization ──────────────────────
/**
 * Normalize a skill name using pattern matching
 * Maps variations (JS, Java Script, etc.) to canonical form (JavaScript)
 */
function normalizeSkill(skill) {
  if (!skill) return null;
  const lower = skill.toLowerCase().trim();
  
  // Direct match in patterns
  if (SKILL_PATTERNS[lower]) return lower;
  
  // Match against patterns (fuzzy)
  for (const [canonical, variants] of Object.entries(SKILL_PATTERNS)) {
    for (const variant of variants) {
      if (lower === variant || lower.includes(variant) || variant.includes(lower)) {
        return canonical;
      }
    }
  }
  
  return lower; // Return as-is if no pattern match
}

/**
 * Extract and normalize skills from text using pattern matching
 * Returns normalized skill list with deduplication
 */
function extractSkillsWithPatterns(text) {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const found = new Set();
  
  // First pass: pattern matching
  for (const [canonical, variants] of Object.entries(SKILL_PATTERNS)) {
    for (const variant of variants) {
      const pattern = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(textLower)) {
        found.add(canonical);
        break; // Found this skill, move to next canonical
      }
    }
  }
  
  // Second pass: dictionary-based skills not covered by patterns
  for (const skill of ALL_SKILLS) {
    if (!SKILL_PATTERNS[skill]) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(textLower)) found.add(skill);
    }
  }
  
  return [...found];
}


// ── STAGE 1: Text Preprocessor (from scratch) ──────────────
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from",
  "as","is","was","are","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","i","me","my","we","our","you",
  "your","he","his","she","her","it","its","they","their","this","that","these",
  "those","who","which","what","not","no","so","also","just","very","about","work",
  "good","excellent","strong","proficient","familiar","knowledge","experience",
  "working","responsible","developed","using","team","member","various","multiple"
]);

const LEMMA_RULES = [
  [/ing$/, ""], [/tion$/, "te"], [/sion$/, "d"], [/ment$/, ""],
  [/ness$/, ""], [/ity$/, ""], [/ed$/, ""], [/ly$/, ""],
  [/ies$/, "y"], [/s$/, ""]
];

function lemmatize(word) {
  if (word.length <= 4) return word;
  for (const [pat, rep] of LEMMA_RULES) {
    if (pat.test(word)) {
      const result = word.replace(pat, rep);
      if (result.length >= 3) return result;
    }
  }
  return word;
}

function preprocessText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\.\+\#\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .map(w => lemmatize(w));
}

// ── STAGE 2: Skill Extractor (Dictionary + Regex) ──────────
function extractSkills(text) {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const found = new Set();
  for (const skill of ALL_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(textLower)) found.add(skill);
  }
  return [...found];
}

function extractCGPA(text) {
  if (!text) return null;
  const patterns = [
    /cgpa[:\s]+(\d+\.?\d*)/i,
    /gpa[:\s]+(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:cgpa|gpa)/i,
    /(\d+\.?\d*)\s*\/\s*10/i,
    /(\d+\.\d+)\s*out\s*of\s*10/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const val = parseFloat(m[1]);
      if (val >= 0 && val <= 10) return val;
      if (val > 10 && val <= 100) return +(val / 10).toFixed(2);
    }
  }
  return null;
}

function extractBranch(text) {
  const branches = {
    "computer science": "CSE", "cse": "CSE",
    "information technology": "IT", "mca": "MCA",
    "electronics": "ECE", "ece": "ECE",
    "electrical": "EE", "mechanical": "ME",
    "data science": "DS", "artificial intelligence": "AI",
    "bca": "BCA", "mba": "MBA", "it": "IT"
  };
  const tl = text.toLowerCase();
  for (const [k, v] of Object.entries(branches)) {
    if (tl.includes(k)) return v;
  }
  return null;
}

// ── STAGE 3: Custom TF-IDF (from scratch) ──────────────────
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  if (!total) return tf;
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  for (const t in tf) tf[t] = tf[t] / total;
  return tf;
}

function computeIDF(allDocs) {
  const idf = {};
  const N = allDocs.length;
  const allTerms = new Set(allDocs.flat());
  for (const term of allTerms) {
    const df = allDocs.filter(d => d.includes(term)).length;
    idf[term] = Math.log(N / df) + 1;
  }
  return idf;
}

function computeTFIDF(tokens, idf) {
  const tf = computeTF(tokens);
  const tfidf = {};
  for (const term in tf) tfidf[term] = tf[term] * (idf[term] || 1);
  return tfidf;
}

// ── STAGE 4: Custom Cosine Similarity (from scratch) ────────
function cosineSimilarity(vecA, vecB) {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  for (const t of allTerms) {
    const a = vecA[t] || 0;
    const b = vecB[t] || 0;
    dot  += a * b;
    magA += a * a;
    magB += b * b;
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

// ── STAGE 5: Skill Gap Graph Scoring (Novel — Nutan) ────────
function findSameCategorySkill(skill, candidateSet) {
  for (const skills of Object.values(SKILLS_KB)) {
    if (skills.includes(skill)) {
      for (const s of skills) {
        if (candidateSet.has(s) && s !== skill) return s;
      }
    }
  }
  return null;
}

function skillGapScore(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0)
    return { score: 1.0, matched: [], partial: [], missing: [], detail: [] };

  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  const matched = [], partial = [], missing = [], detail = [];
  let total = 0;

  for (const req of requiredSkills) {
    const r = req.toLowerCase();
    if (candidateSet.has(r)) {
      total += 1.0;
      matched.push(req);
      detail.push({ skill: req, status: "exact", credit: 1.0 });
    } else {
      const related = (SKILL_GRAPH[r] || []).find(x => candidateSet.has(x));
      if (related) {
        total += 0.5;
        partial.push({ required: req, has: related });
        detail.push({ skill: req, status: "partial", has: related, credit: 0.5 });
      } else {
        const cat = findSameCategorySkill(r, candidateSet);
        if (cat) {
          total += 0.25;
          detail.push({ skill: req, status: "category", has: cat, credit: 0.25 });
        } else {
          missing.push(req);
          detail.push({ skill: req, status: "missing", credit: 0.0 });
        }
      }
    }
  }

  return {
    score:   Math.min(total / requiredSkills.length, 1.0),
    matched, partial, missing, detail
  };
}

// ── STAGE 5.5: Skill Impact Predictor (SIP) ────────────────
/**
 * Calculate score improvement if candidate acquires each missing skill
 * Returns: { skill: "Docker", currentScore: 0.74, scoreAfterSkill: 0.79, improvement: +5% }
 */
function predictSkillImpact(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { impacts: [], recommendations: [] };
  }

  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  const currentGap = skillGapScore(candidateSkills, requiredSkills);
  const impacts = [];

  // Test each missing skill
  for (const missing of requiredSkills) {
    const r = missing.toLowerCase();
    if (!candidateSet.has(r)) {
      // Simulate acquiring this skill
      const testSkills = [...candidateSkills, missing];
      const testGap = skillGapScore(testSkills, requiredSkills);
      const improvement = (testGap.score - currentGap.score) * 100;

      impacts.push({
        skill: missing,
        currentScore: Math.round(currentGap.score * 10000) / 100,
        scoreAfterSkill: Math.round(testGap.score * 10000) / 100,
        improvement: Math.round(improvement * 100) / 100,
        priority: improvement > 5 ? "high" : improvement > 2 ? "medium" : "low"
      });
    }
  }

  // Sort by improvement (descending)
  impacts.sort((a, b) => b.improvement - a.improvement);

  // Top recommendations
  const recommendations = impacts
    .filter(i => i.priority === "high")
    .slice(0, 3)
    .map(i => `Learn ${i.skill} → Score becomes ${i.scoreAfterSkill}% (↑ ${i.improvement}%)`);

  return {
    currentScore: Math.round(currentGap.score * 10000) / 100,
    impacts,
    recommendations,
    topSkill: impacts.length > 0 ? impacts[0].skill : null,
    topImprovement: impacts.length > 0 ? impacts[0].improvement : 0
  };
}

// ── Enhanced Explainability & Compatibility Matrix ────────
/**
 * Generate detailed compatibility breakdown for a candidate-job pair
 * Returns: { academicFit, skillFit, projectFit, overallScore, explanation }
 */
function generateCompatibilityMatrix(candidate, drive) {
  const cgpa = candidate.cgpa || 0;
  const minCgpa = drive.minCgpa || 0;
  
  // Academic Fit (CGPA + eligibility)
  const academicFit = Math.min((cgpa / 10), 1.0) * 100;
  const academicPass = cgpa >= minCgpa ? "✓ Pass" : "✗ Below Min";

  // Skill Fit (skill gap score)
  const skillGap = skillGapScore(candidate.skills || [], drive.requiredSkills || []);
  const skillFit = Math.round(skillGap.score * 100);
  const skillBreakdown = `${skillGap.matched.length} exact, ${skillGap.partial.length} partial, ${skillGap.missing.length} missing`;

  // Project Fit (text similarity + CGPA bonus)
  const jdText = [drive.title, drive.description, ...(drive.requiredSkills||[])].join(" ");
  const jdTokens = preprocessText(jdText);
  const resumeTokens = preprocessText(candidate.resumeText || (candidate.skills||[]).join(" "));
  
  const allDocs = [jdTokens, resumeTokens];
  const idf = computeIDF(allDocs);
  const jdVector = computeTFIDF(jdTokens, idf);
  const resumeVector = computeTFIDF(resumeTokens, idf);
  const textSim = cosineSimilarity(resumeVector, jdVector);
  
  const projectFit = Math.round(textSim * 100);
  const projectNote = textSim > 0.7 ? "Strong alignment" : textSim > 0.4 ? "Moderate alignment" : "Weak alignment";

  // Overall score (weighted)
  const overallScore = Math.round(
    (skillFit * 0.40 + academicFit * 0.25 + projectFit * 0.20 + (cgpa >= minCgpa ? 100 : 50) * 0.15)
  );

  return {
    academicFit: Math.round(academicFit),
    academicStatus: academicPass,
    skillFit,
    skillBreakdown,
    projectFit,
    projectNote,
    overallScore,
    summary: {
      "Academic Fit": `${Math.round(academicFit)}% (CGPA: ${cgpa}/${10}) ${academicPass}`,
      "Skill Fit": `${skillFit}% (${skillBreakdown})`,
      "Project Fit": `${projectFit}% (${projectNote})`,
      "Overall Compatibility": `${overallScore}%`
    }
  };
}

/**
 * Generate a student-focused insights report
 */
function generateStudentInsights(candidate, drive) {
  const compat = generateCompatibilityMatrix(candidate, drive);
  const skillImpact = predictSkillImpact(candidate.skills || [], drive.requiredSkills || []);
  
  return {
    overallScore: compat.overallScore,
    compatibility: compat.summary,
    strengths: {
      matched: (skillGapScore(candidate.skills || [], drive.requiredSkills || []).matched || []).slice(0, 5),
      academicFit: compat.academicStatus,
      projectAlignment: compat.projectNote
    },
    gaps: {
      missing: (skillGapScore(candidate.skills || [], drive.requiredSkills || []).missing || []).slice(0, 5),
      count: skillGapScore(candidate.skills || [], drive.requiredSkills || []).missing.length
    },
    recommendations: skillImpact.recommendations,
    improvementPath: skillImpact.impacts.slice(0, 3),
    nextSteps: skillImpact.topSkill 
      ? [`Priority: Learn ${skillImpact.topSkill} to increase score by ${skillImpact.topImprovement}%`]
      : ["You have all required skills!"]
  };
}

// ── STAGE 6: Eligibility Check ──────────────────────────────
function checkEligibility(student, drive) {
  let score = 1.0;
  const reasons = [];

  if ((student.cgpa || 0) < (drive.minCgpa || 0)) {
    score -= 0.5;
    reasons.push(`CGPA ${student.cgpa} < required ${drive.minCgpa}`);
  }

  const branches = drive.allowedBranches || [];
  const branch   = student.branch || "";
  if (branches.length > 0 && branch) {
    const ok = branches.some(b =>
      b.toLowerCase().includes(branch.toLowerCase()) ||
      branch.toLowerCase().includes(b.toLowerCase())
    );
    if (!ok) { score -= 0.3; reasons.push(`Branch ${branch} not allowed`); }
  }

  if ((student.backlogs || 0) > (drive.maxBacklogs ?? 0)) {
    score -= 0.3;
    reasons.push(`Backlogs ${student.backlogs} > allowed ${drive.maxBacklogs}`);
  }

  const years = drive.graduationYears || [];
  if (years.length > 0 && student.graduationYear) {
    if (!years.includes(student.graduationYear)) {
      score -= 0.2;
      reasons.push(`Graduation year ${student.graduationYear} not in allowed list`);
    }
  }

  return { score: Math.max(score, 0), eligible: score >= 0.5, reasons };
}

// ── MAIN: MSCEA ─────────────────────────────────────────────
function runMSCEA(applicants, drive, threshold = 60) {
  const start = Date.now();

  // ─ Round 1: Hard Eligibility ─────────────────────────────
  const r1_pass = [], r1_fail = [];
  for (const s of applicants) {
    const e = checkEligibility(s, drive);
    if (e.eligible) r1_pass.push({ ...s, _elig: e });
    else r1_fail.push({ ...s, eliminatedAt: "Round 1", reasons: e.reasons });
  }

  // ─ Round 2: Skill Gap Filter ─────────────────────────────
  const r2_pass = [], r2_fail = [];
  for (const s of r1_pass) {
    const sk = skillGapScore(s.skills || [], drive.requiredSkills || []);
    if (sk.score >= 0.25) r2_pass.push({ ...s, _skill: sk });
    else r2_fail.push({
      ...s, eliminatedAt: "Round 2",
      reasons: [`Skill match ${(sk.score*100).toFixed(1)}% < minimum 25%`]
    });
  }

  // ─ Round 3: AI Scoring (TF-IDF + Cosine + Weighted) ──────
  const jdText    = [drive.title, drive.description, ...(drive.requiredSkills||[]), ...(drive.preferredSkills||[])].join(" ");
  const jdTokens  = preprocessText(jdText);
  const allDocs   = [jdTokens, ...r2_pass.map(s => preprocessText(s.resumeText || (s.skills||[]).join(" ")))];
  const idf       = computeIDF(allDocs);
  const jdVector  = computeTFIDF(jdTokens, idf);

  const r3_scored = [], r3_fail = [];

  for (const s of r2_pass) {
    const resumeTokens  = preprocessText(s.resumeText || (s.skills||[]).join(" "));
    const resumeVector  = computeTFIDF(resumeTokens, idf);
    const textSim       = cosineSimilarity(resumeVector, jdVector);

    const cgpaNorm      = Math.min((s.cgpa||0) / 10, 1.0);
    const cgpaScore     = (s.cgpa||0) >= (drive.minCgpa||0) + 1.5 ? Math.min(cgpaNorm * 1.1, 1.0) : cgpaNorm;
    const skillScore    = s._skill.score;
    const eligScore     = s._elig.score;

    const finalScore =
      0.40 * skillScore +
      0.25 * cgpaScore  +
      0.20 * textSim    +
      0.15 * eligScore;

    const pct = Math.round(finalScore * 10000) / 100;

    const entry = {
      studentId:    s._id || s.id,
      name:         s.name,
      email:        s.email,
      cgpa:         s.cgpa,
      branch:       s.branch,
      skills:       s.skills,
      college:      s.college,
      aiScore:      pct,
      skillScore:   Math.round(skillScore * 10000) / 100,
      cgpaScore:    Math.round(cgpaScore  * 10000) / 100,
      textScore:    Math.round(textSim    * 10000) / 100,
      eligScore:    Math.round(eligScore  * 10000) / 100,
      matchedSkills: s._skill.matched,
      missingSkills: s._skill.missing,
      partialSkills: s._skill.partial,
      reasons:      s._elig.reasons,
      shortlisted:  pct >= threshold
    };

    if (pct >= threshold * 0.5) r3_scored.push(entry);
    else r3_fail.push({ ...entry, eliminatedAt: "Round 3", reasons: [`AI Score ${pct}% too low`] });
  }

  r3_scored.sort((a, b) => b.aiScore - a.aiScore);

  // ─ Round 4: Diversity Balance ─────────────────────────────
  const collegeCount = {};
  const maxPerCollege = drive.maxPerCollege || 999;
  const maxShortlist  = drive.maxShortlist  || 999;
  const final = [], r4_removed = [];

  for (const c of r3_scored) {
    if (c.aiScore < threshold) {
      r4_removed.push({ ...c, eliminatedAt: "Round 4", reasons: [`Score ${c.aiScore}% < threshold ${threshold}%`] });
      continue;
    }
    const col = c.college || "Unknown";
    collegeCount[col] = (collegeCount[col] || 0) + 1;
    if (collegeCount[col] > maxPerCollege) {
      r4_removed.push({ ...c, eliminatedAt: "Round 4", reasons: [`College cap reached`] });
      continue;
    }
    if (final.length >= maxShortlist) {
      r4_removed.push({ ...c, eliminatedAt: "Round 4", reasons: [`Shortlist limit reached`] });
      continue;
    }
    final.push({ ...c, shortlisted: true });
  }

  const eliminated = [...r1_fail, ...r2_fail, ...r3_fail, ...r4_removed];
  const avg = final.length ? +(final.reduce((s,c) => s + c.aiScore, 0) / final.length).toFixed(2) : 0;

  return {
    summary: {
      total:            applicants.length,
      afterRound1:      r1_pass.length,
      afterRound2:      r2_pass.length,
      afterRound3:      r3_scored.length,
      shortlisted:      final.length,
      threshold,
      avgScore:         avg,
      processingMs:     Date.now() - start
    },
    shortlisted: final,
    eliminated,
    allCandidates: [...final, ...r3_scored.filter(c => c.aiScore < threshold), ...eliminated]
  };
}

module.exports = {
  runMSCEA,
  extractSkills,
  extractSkillsWithPatterns,
  normalizeSkill,
  extractCGPA,
  extractBranch,
  preprocessText,
  skillGapScore,
  predictSkillImpact,
  generateCompatibilityMatrix,
  generateStudentInsights,
  cosineSimilarity,
  SKILLS_KB,
  SKILL_GRAPH,
  SKILL_PATTERNS
};