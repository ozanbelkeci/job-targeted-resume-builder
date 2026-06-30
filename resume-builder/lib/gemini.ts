import OpenAI from 'openai';
import type { GeminiOptimizationResult, OptimizedCv, LinkedInSuggestions, TipContext } from '@/types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ParsedExperience {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

interface ParsedCv {
  name: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  location: string | null;
  summary: string | null;
  experience: ParsedExperience[];
  education: Array<{ degree: string; school: string; year: string }>;
  skills: string[];
  references: Array<{ name: string; title: string; contact: string }>;
}

interface WorkStructure {
  job1Title: string;
  job1Period: string;
  company1: string;
  job2Title: string | null;
  job2Period: string | null;
  company2: string | null;
}

// ─────────────────────────────────────────────
//  Date parsing helpers — sort experience by
//  start date descending (most recent first).
//  "Present" / "Now" / "Current" entries always
//  go to position 0.
// ─────────────────────────────────────────────

const MONTH_MAP: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
  sep: 9, oct: 10, nov: 11, dec: 12,
};

function dateToSortKey(dateStr: string): number {
  if (/present|now|current|ongoing/i.test(dateStr)) return 999999;
  const lower = dateStr.toLowerCase();
  let year = 0;
  let month = 6; // default to mid-year when month is unknown
  const yearMatch = dateStr.match(/\d{4}/);
  if (yearMatch) year = parseInt(yearMatch[0], 10);
  for (const [name, num] of Object.entries(MONTH_MAP)) {
    if (lower.includes(name)) { month = num; break; }
  }
  return year * 100 + month;
}

/** Returns a sort key for the START date of a "Start - End" period string. */
function startDateKey(period: string): number {
  const parts = period.split(/\s*[-–]\s*/);
  return dateToSortKey(parts[0] ?? '');
}

function isCurrentJob(period: string): boolean {
  return /present|now|current|ongoing/i.test(period);
}

/** Sorts experience entries: current job first, then by start date descending. */
function sortByDate<T extends { period?: string; duration?: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ap = a.period ?? a.duration ?? '';
    const bp = b.period ?? b.duration ?? '';
    const aCurrent = isCurrentJob(ap);
    const bCurrent = isCurrentJob(bp);
    if (aCurrent && !bCurrent) return -1;
    if (!aCurrent && bCurrent) return 1;
    return startDateKey(bp) - startDateKey(ap); // descending start date
  });
}

// ─────────────────────────────────────────────
//  Two-column PDF layout detection
// ─────────────────────────────────────────────

const TITLE_PERIOD_RE = /([A-Za-z][A-Za-z\s/,()-]{3,60}?)\s*\|\s*(\d{4}\s*[-–]\s*(?:\d{4}|Present|Current|Now))/i;

function detectWorkStructure(rawText: string): WorkStructure | null {
  const workExpIdx = rawText.search(/\b(?:WORK EXPERIENCE|WORK HISTORY|PROFESSIONAL EXPERIENCE)\b/i);
  if (workExpIdx === -1) return null;

  const beforeSection = rawText.substring(0, workExpIdx);
  const afterSection = rawText.substring(workExpIdx);

  const preTitleRe = /([A-Za-z][A-Za-z\s/,()-]{3,60}?)\s*\|\s*(\d{4}\s*[-–]\s*(?:\d{4}|Present|Current|Now))/gi;
  const preMatches: RegExpExecArray[] = [];
  let pm: RegExpExecArray | null;
  while ((pm = preTitleRe.exec(beforeSection)) !== null) preMatches.push(pm);
  if (preMatches.length === 0) return null;

  const job1Match = preMatches[preMatches.length - 1];
  const job1Title = job1Match[1].trim();
  const job1Period = job1Match[2].trim();

  const isCompanyLine = (line: string): boolean => {
    if (line.length < 3 || line.length > 80) return false;
    if (line.includes('|')) return false;
    if (/^[-•·▪]/.test(line)) return false;
    if (/^[A-ZĞÜŞÖÇI\s]{5,}$/.test(line)) return false;
    if (/^\d/.test(line)) return false;
    if (line.split(' ').length > 9) return false;
    return true;
  };

  const lines = afterSection.split('\n').map((l) => l.trim()).filter(Boolean);
  const companyNames: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (isCompanyLine(lines[i]) && !TITLE_PERIOD_RE.test(lines[i])) {
      companyNames.push(lines[i]);
      if (companyNames.length >= 4) break;
    }
  }
  if (companyNames.length === 0) return null;

  const company1 = companyNames[0];
  const company2 = companyNames[1] ?? null;

  let job2Title: string | null = null;
  let job2Period: string | null = null;
  if (company2) {
    const c1Idx = afterSection.indexOf(company1);
    const c2Idx = afterSection.indexOf(company2, c1Idx + company1.length);
    if (c1Idx !== -1 && c2Idx !== -1) {
      const between = afterSection.substring(c1Idx + company1.length, c2Idx);
      const j2 = TITLE_PERIOD_RE.exec(between);
      if (j2) { job2Title = j2[1].trim(); job2Period = j2[2].trim(); }
    }
  }

  return { job1Title, job1Period, company1, job2Title, job2Period, company2 };
}

function buildStructureHint(ws: WorkStructure): string {
  let hint = `
⚠️ CRITICAL — VERIFIED COMPANY-JOB MAPPING (follow exactly):

This CV was extracted from a two-column PDF. The correct mapping is:

  Job 1 (most recent): Company = "${ws.company1}" | Title = "${ws.job1Title}" | Period = "${ws.job1Period}"`;
  if (ws.company2 && ws.job2Title && ws.job2Period) {
    hint += `
  Job 2: Company = "${ws.company2}" | Title = "${ws.job2Title}" | Period = "${ws.job2Period}"`;
  }
  hint += `

The raw text shows "${ws.company1}" followed immediately by "${ws.job2Title ?? 'another title'}" — this is MISLEADING due to the column layout. The title "${ws.job1Title} | ${ws.job1Period}" appeared earlier in the text and belongs to "${ws.company1}".
Use the verified mapping above, not what appears adjacent in the raw text.`;
  return hint;
}

function enforceCorrectMapping(parsed: ParsedCv, ws: WorkStructure): ParsedCv {
  if (!parsed.experience || parsed.experience.length === 0) return parsed;
  const exp = parsed.experience.map((e) => ({ ...e }));

  const job1Idx = exp.findIndex(
    (e) =>
      e.title.toLowerCase().includes(ws.job1Title.toLowerCase().substring(0, 10)) ||
      e.company.toLowerCase().includes(ws.company1.toLowerCase().substring(0, 6)),
  );

  if (job1Idx !== -1) {
    exp[job1Idx].title = ws.job1Title;
    exp[job1Idx].company = ws.company1;
    exp[job1Idx].period = ws.job1Period;
    if (job1Idx > 0) {
      const [entry] = exp.splice(job1Idx, 1);
      exp.unshift(entry);
    }
  } else {
    exp[0].title = ws.job1Title;
    exp[0].company = ws.company1;
    exp[0].period = ws.job1Period;
  }

  if (ws.company2 && ws.job2Title && ws.job2Period) {
    const job2Idx = exp.findIndex(
      (e, i) =>
        i > 0 &&
        (e.company.toLowerCase().includes(ws.company2!.toLowerCase().substring(0, 6)) ||
          e.title.toLowerCase().includes(ws.job2Title!.toLowerCase().substring(0, 8))),
    );
    if (job2Idx !== -1) {
      exp[job2Idx].title = ws.job2Title;
      exp[job2Idx].company = ws.company2;
      exp[job2Idx].period = ws.job2Period;
    }
  }

  return { ...parsed, experience: exp };
}

// ─────────────────────────────────────────────
//  Parse step
// ─────────────────────────────────────────────

async function parseRawCvText(rawText: string): Promise<ParsedCv> {
  const workStructure = detectWorkStructure(rawText);
  const structureHint = workStructure ? buildStructureHint(workStructure) : '';

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are a professional CV parser.
${structureHint}

Extract ALL data from the CV text below. Return ONLY valid JSON (no markdown):

{
  "name": "string",
  "email": "string or null",
  "phone": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "website": "string or null",
  "location": "string or null",
  "summary": "string or null",
  "experience": [
    { "title": "string", "company": "string", "period": "string (exact from CV)", "bullets": ["string"] }
  ],
  "education": [{ "degree": "string", "school": "string", "year": "string" }],
  "skills": ["string"],
  "references": [{ "name": "string", "title": "string", "contact": "string" }]
}

=== CV TEXT ===
${rawText}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.0,
  });

  const text = response.choices[0].message.content ?? '{}';
  let parsed = JSON.parse(text) as ParsedCv;

  // 1. Enforce correct company↔title mapping for two-column PDFs
  if (workStructure) parsed = enforceCorrectMapping(parsed, workStructure);

  // 2. Sort by start date (most recent first) — handles ALL CVs
  if (parsed.experience) parsed.experience = sortByDate(parsed.experience);

  return parsed;
}

function formatParsedCvForPrompt(cv: ParsedCv): string {
  const lines: string[] = [];
  lines.push(`NAME: ${cv.name}`);
  if (cv.email) lines.push(`EMAIL: ${cv.email}`);
  if (cv.phone) lines.push(`PHONE: ${cv.phone}`);
  if (cv.linkedin) lines.push(`LINKEDIN: ${cv.linkedin}`);
  if (cv.github) lines.push(`GITHUB: ${cv.github}`);
  if (cv.website) lines.push(`WEBSITE: ${cv.website}`);
  if (cv.location) lines.push(`LOCATION: ${cv.location}`);
  if (cv.summary) { lines.push('\nSUMMARY:'); lines.push(cv.summary); }
  if (cv.experience.length > 0) {
    lines.push('\nEXPERIENCE (verified order — do NOT reorder):');
    cv.experience.forEach((exp, i) => {
      lines.push(`\n[${i + 1}] ${exp.title} | ${exp.company} | ${exp.period}`);
      exp.bullets.forEach((b) => lines.push(`    - ${b}`));
    });
  }
  if (cv.education.length > 0) {
    lines.push('\nEDUCATION:');
    cv.education.forEach((edu) => lines.push(`  - ${edu.degree} | ${edu.school} | ${edu.year}`));
  }
  if (cv.skills.length > 0) lines.push(`\nSKILLS: ${cv.skills.join(', ')}`);
  if (cv.references && cv.references.length > 0) {
    lines.push('\nREFERENCES:');
    cv.references.forEach((ref) => lines.push(`  - ${ref.name} | ${ref.title} | ${ref.contact}`));
  }
  return lines.join('\n');
}

// ─────────────────────────────────────────────
//  Programmatic keyword correction
//  Runs AFTER the AI returns its result to fix
//  inconsistent fuzzy-matching errors.
// ─────────────────────────────────────────────

function extractCvFullText(cv: OptimizedCv): string {
  const skillsText = Array.isArray(cv.skills)
    ? cv.skills.join(' ')
    : Object.values(cv.skills).flat().join(' ');
  return [
    cv.name,
    cv.summary ?? '',
    skillsText,
    ...cv.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
    ...cv.education.map((e) => `${e.degree} ${e.school}`),
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Common tech abbreviation pairs (bidirectional).
 * If EITHER form appears in the CV when the OTHER is in the JD, count as matched.
 */
const TECH_ALIASES: Array<[string, string]> = [
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['kubernetes', 'k8s'],
  ['python', 'py'],
  ['postgresql', 'postgres'],
  ['mongodb', 'mongo'],
  ['elasticsearch', 'elastic'],
  ['rabbitmq', 'rabbit'],
  ['amazon web services', 'aws'],
  ['google cloud platform', 'gcp'],
  ['continuous integration', 'ci'],
  ['continuous deployment', 'cd'],
  ['node.js', 'node'],
  ['react.js', 'react'],
  ['next.js', 'next'],
  ['vue.js', 'vue'],
];

/**
 * Bidirectional fuzzy keyword matching — 3 rules + alias table.
 *
 * R1 — Direct substring: keyword contained anywhere in cvText
 *      "kafka" in JD → "Apache Kafka" in CV → matched (R1)
 *
 * R2 — Per-word: for each significant word (≥ 4 chars) in a multi-word keyword,
 *      check if that word alone appears in the CV
 *      "Apache Kafka" in JD → "kafka" checked separately → matched if CV has "Kafka"
 *
 * R3 — Bidirectional token: for each keyword part, check every CV token;
 *      if either contains the other → matched
 *      "mongo" ↔ "mongodb", "postgres" ↔ "postgresql", "node.js" ↔ "node"
 *
 * R4 — Alias table: handles k8s↔kubernetes, js↔javascript, aws, etc.
 */
function keywordFoundInCv(keyword: string, cvText: string): boolean {
  const kw = keyword.toLowerCase().trim();
  const cv = cvText.toLowerCase();

  // R1: direct substring
  if (cv.includes(kw)) return true;

  const kwParts = kw.split(/\s+/);
  const sigParts = kwParts.filter((w) => w.length >= 4);

  // R2: each significant word of a multi-word keyword tried independently
  for (const part of sigParts) {
    if (cv.includes(part)) return true;
  }

  // R3: bidirectional token-level match for each keyword part
  // Minimum 5 chars to prevent short tokens (e.g. "net" from ".NET") from
  // matching unrelated keywords (e.g. "kubernetes" contains "net").
  const cvTokens = cv.split(/[\s,;.:()\[\]{}\n/\\|+@#$%^&*!?<>'"]+/).filter((t) => t.length >= 5);
  for (const part of sigParts) {
    for (const token of cvTokens) {
      if (token.includes(part) || part.includes(token)) return true;
    }
  }

  // R4: alias table (bidirectional)
  for (const [long, short] of TECH_ALIASES) {
    const kwIsLong = kw === long || kw.includes(long);
    const kwIsShort = kw === short || kw.includes(short);
    const cvHasLong = cv.includes(long);
    const cvHasShort = cv.includes(short);
    if ((kwIsLong && cvHasShort) || (kwIsShort && cvHasLong)) return true;
  }

  return false;
}

/**
 * Post-processes AI keyword output: moves any "missing" keyword that is
 * actually present in the CV (via fuzzy matching) into the matched list,
 * then recalculates the ATS score.
 */
function correctKeywords(result: GeminiOptimizationResult): GeminiOptimizationResult {
  const cvText = extractCvFullText(result.optimized_cv);

  // Forward check: AI said "missing" but keyword IS in CV → move to matched
  const rescuedFromMissing: string[] = [];
  const confirmedMissing: string[] = [];
  for (const kw of result.missing_keywords) {
    if (keywordFoundInCv(kw, cvText)) {
      rescuedFromMissing.push(kw);
    } else {
      confirmedMissing.push(kw);
    }
  }

  // Reverse check: AI said "matched" but keyword is NOT in CV → move to missing
  const confirmedMatched: string[] = [];
  const demotedToMissing: string[] = [];
  for (const kw of result.matched_keywords) {
    if (keywordFoundInCv(kw, cvText)) {
      confirmedMatched.push(kw);
    } else {
      demotedToMissing.push(kw);
    }
  }

  const finalMatched = confirmedMatched.concat(rescuedFromMissing);
  const finalMissing = confirmedMissing.concat(demotedToMissing);

  // Deduplicate (case-insensitive)
  function dedup(list: string[]): string[] {
    const seen: string[] = [];
    return list.filter((k) => {
      const lower = k.toLowerCase();
      if (seen.indexOf(lower) !== -1) return false;
      seen.push(lower);
      return true;
    });
  }

  const dedupedMatched = dedup(finalMatched);
  const dedupedMissing = dedup(finalMissing);

  const atsScore = Math.round(
    (dedupedMatched.length / Math.max(dedupedMatched.length + dedupedMissing.length, 1)) * 100,
  );

  return {
    ...result,
    matched_keywords: dedupedMatched,
    missing_keywords: dedupedMissing,
    ats_score: atsScore,
  };
}

// ─────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────

export async function optimizeResume(
  rawCvText: string,
  jobDescription: string,
  selectedKeywords: string[] = [],
  tipContexts: TipContext[] = [],
  generalContext: string = '',
  candidateContext: string = '',
): Promise<GeminiOptimizationResult> {
  const parsedCv = await parseRawCvText(rawCvText);
  const structuredCvText = formatParsedCvForPrompt(parsedCv);

  const filledTipContexts = tipContexts.filter((tc) => tc.user_input.trim());

  const hasAdditionalInput =
    selectedKeywords.length > 0 || filledTipContexts.length > 0 || generalContext.trim();

  const additionalInputBlock = hasAdditionalInput
    ? `
--- ADDITIONAL USER INPUT ---
${selectedKeywords.length > 0 ? `
The user has confirmed they have experience with these keywords:
${selectedKeywords.join(', ')}
You MUST add each one verbatim (exact wording, not a paraphrase or synonym) to the Skills section under the most relevant category. Additionally, naturally reference at least one of them in the Professional Summary or in a relevant experience bullet where it fits contextually.
Do not rename, abbreviate, or rephrase these terms — the exact text must appear somewhere in the resume so it is unambiguously present.
` : ''}${filledTipContexts.length > 0 ? `
The user has provided additional context for specific improvement areas:
${filledTipContexts.map((tc) => `- Tip: "${tc.tip_text}" → User context: "${tc.user_input}"`).join('\n')}
Incorporate this information naturally and accurately into the resume.
` : ''}${generalContext.trim() ? `
The user wants to add the following information to their resume:
${generalContext.trim()}
Incorporate this naturally. Do not fabricate anything beyond what the user has explicitly stated.
` : ''}${(filledTipContexts.length > 0 || generalContext.trim()) ? `
PLACEMENT RULE — When the user provides specific project or experience details in their additional input, you MUST add it as a concrete bullet point under the most relevant experience entry in the Work Experience section. Do NOT only mention it in the Professional Summary — that is not enough.
The bullet point must be specific and action-oriented. Use the exact details the user provided.
Example:
  User input: "I built a tool management app with WinForms where users can save and view equipment"
  Wrong (summary only): "experienced in WinForms development"
  Correct (experience bullet): "Developed a desktop tool management application using Windows Forms, enabling users to save, view, and manage equipment records."
Rule: If the user mentions a specific project, feature, or technology in their input → it MUST appear as a bullet point in the experience section, not just a vague mention in the summary.

TIP DEDUPLICATION RULE — After incorporating all user inputs into the resume, review the new tips you are about to generate.
For each tip, check: has this topic already been addressed in the updated resume content (either in experience bullets, summary, or skills)?
If yes → do NOT include that tip. Replace it with a genuinely different improvement suggestion based on remaining gaps.
A topic is considered "addressed" if:
- The user provided input about it AND
- It now appears as a concrete bullet point or skill in the resume
Do not repeat tips that the user has already acted on.
` : ''}
IMPORTANT: After incorporating all user inputs, recalculate everything from scratch based on the NEW resume content:
- matched_keywords: keywords from job description found in the NEW resume
- missing_keywords: keywords from job description NOT in the NEW resume
- ats_score: recalculate based on the NEW resume vs job description
- tips: generate completely new tips based on remaining gaps
Do NOT carry over previous matched/missing lists or scores.
All output must be in English.`
    : '';

  const prompt = `You are a professional resume writer and ATS (Applicant Tracking System) expert with deep knowledge of how modern ATS systems parse and rank resumes.

Your goal is to produce a highly ATS-optimized resume that also reads naturally to human recruiters.

---

STRICT RULES — follow every single one:

**1. Job Title Header**
Add a clear job title directly under the candidate's name.
Extract the most relevant title from the job description.
Example: "Senior .NET Developer" or "Backend Engineer"

**2. Keyword Integration**
- Extract ALL technical keywords, tools, frameworks, and soft skills from the job description.
- Integrate them naturally throughout the resume — in summary, experience bullets, and skills section.
- Never stuff keywords unnaturally. Each keyword must appear in context.
- If a keyword appears in the job description multiple times, treat it as high priority.

**3. Experience Bullets**
Every bullet point must follow this structure:
[Strong action verb] + [specific technology/method] + [measurable outcome or context]

Examples:
✅ "Designed and deployed a microservices architecture using .NET Core and Docker, reducing deployment time by 35%"
✅ "Optimized SQL Server queries resulting in 40% improvement in application response time"
❌ "Worked on various projects using .NET"
❌ "Responsible for database management"

Rules for bullets:
- Start every bullet with a strong, varied action verb (Developed, Architected, Optimized, Reduced, Implemented, Delivered, Automated, Designed, Led, Built, Improved, Streamlined)
- Never start two consecutive bullets with the same verb
- Add measurable outcomes wherever the user's experience allows it (percentages, scale, team size, user count, time saved)
- If no specific metric is available, add context (production environment, team of X, enterprise-level, etc.)
- Minimum 3 bullets per experience entry, maximum 6

**4. Professional Summary**
- 3-5 sentences, keyword-rich
- Must include: years of experience, top 3-4 core technologies, one key achievement or strength, alignment with the target role
- Must NOT start with "I" or "Highly skilled" — use a different opening
- Include the exact job title from the job description in the summary

**5. Skills Section**
- Group skills by category: Languages | Frameworks | Databases | Tools | Methodologies
- Include ALL keywords from the job description that the candidate has demonstrated experience with
- Remove skills that have no evidence in the experience section

**6. Remove These Sections Entirely**
- References section — remove completely, it hurts ATS parsing
- Objective statements — outdated, remove if present
- Photos, graphics, tables, columns — plain text only

**7. Formatting Rules for ATS Compatibility**
- Use plain section headers: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS (all caps)
- Date format: "Month YYYY – Month YYYY" or "YYYY – YYYY"
- Company name and job title on the same line or clearly separated
- No special characters except bullet points (•), pipes (|), and dashes (-)
- Spell out abbreviations at least once: "Application Programming Interface (API)"

**8. Do Not Fabricate**
- Never invent experience, technologies, or achievements the candidate hasn't mentioned
- If the user provided additional context in their input, use it as a concrete bullet point in the experience section — not just in the summary
- Only add metrics if they are explicitly provided by the user or clearly implied by their role

**9. ATS Score Calculation**
After writing the resume, calculate scores strictly:

matched_keywords: ONLY keywords that literally appear in the final resume text. Verify each one.

missing_keywords: Keywords from the job description that do NOT appear in the final resume.

ats_score: Calculate as:
(matched_keywords.length / (matched_keywords.length + missing_keywords.length)) * 100
Round to nearest integer.

Bidirectional matching rules for the literal presence check:
  (a) it appears verbatim in the CV, OR
  (b) the JD keyword is a substring of a CV term (e.g., "Mongo" in JD → "MongoDB" in CV = MATCHED), OR
  (c) a CV term is a substring of the JD keyword (e.g., "Microservices" in CV → "Microservices Technologies" in JD = MATCHED), OR
  (d) common abbreviation/variant pairs match (e.g., "JS" ↔ "JavaScript", "TS" ↔ "TypeScript", "K8s" ↔ "Kubernetes", "Postgres" ↔ "PostgreSQL").

**10. Improvement Tips**
Generate 3 specific, actionable tips based on remaining gaps.
Each tip must:
- Reference a specific skill or requirement from the job description
- Suggest a concrete action the candidate can take
- Be written in English
Do NOT repeat tips that the user has already provided input for.

METRIC TIP RULE: Check all experience bullets in the optimized resume.
If NONE of the bullets contain a specific metric, number, percentage, or measurable outcome,
one of the 3 tips MUST be exactly:
"Your resume lacks measurable achievements. Add specific metrics to your bullet points (e.g. team size, user count, performance improvements, delivery timelines). Use the input field below to share any numbers and we will incorporate them into your resume."
If at least one bullet already contains a metric or number, do NOT generate this tip — use a different improvement suggestion instead.

**11. Language**
Respond ONLY in English regardless of the resume or job description language.
Return ONLY valid JSON, no extra text, no markdown code blocks.

---

Return this exact JSON structure:

{
  "job_title": "string",
  "job_company": "string or null",
  "ats_score": number,
  "matched_keywords": ["string"],
  "missing_keywords": ["string"],
  "tips": ["string", "string", "string"],
  "optimized_cv": {
    "name": "string",
    "job_title": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string or null",
    "github": "string or null",
    "portfolio": "string or null",
    "location": "string or null",
    "summary": "string",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "duration": "string",
        "bullets": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "school": "string",
        "year": "string"
      }
    ],
    "skills": {
      "languages": ["string"],
      "frameworks": ["string"],
      "databases": ["string"],
      "tools": ["string"],
      "methodologies": ["string"]
    }
  }
}

--- RESUME ---
${structuredCvText}

--- JOB DESCRIPTION ---
${jobDescription}
${candidateContext.trim() ? `
--- CANDIDATE CONTEXT ---
${candidateContext.trim()}

Use this context to better tailor the resume tone, seniority level, and keyword emphasis.
` : ''}
${additionalInputBlock}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const text = response.choices[0].message.content ?? '';
  const result = JSON.parse(text) as GeminiOptimizationResult;

  // Always sort the final output by start date — catches any remaining reordering
  if (result.optimized_cv?.experience) {
    result.optimized_cv.experience = sortByDate(result.optimized_cv.experience);
  }

  // Programmatic keyword correction: fix AI fuzzy-matching errors (e.g., Mongo↔MongoDB)
  return correctKeywords(result);
}

export async function generateCoverLetter(
  optimizedCv: OptimizedCv,
  jobDescription: string,
): Promise<string> {
  const cvText = JSON.stringify(optimizedCv, null, 2);
  const prompt = `You are an expert career consultant. Write a professional cover letter in English.

Guidelines:
- 3-4 paragraphs, professional tone
- First paragraph: strong opening mentioning the specific role and company
- Middle paragraphs: connect candidate's experience to job requirements
- Final paragraph: confident call to action
- Do NOT use phrases like "I am writing to express my interest"
- Respond with ONLY the cover letter text, no subject line, no JSON

--- OPTIMIZED RESUME ---
${cvText}

--- JOB DESCRIPTION ---
${jobDescription}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0].message.content ?? '';
}

export async function generateLinkedInSuggestions(
  optimizedCv: OptimizedCv,
  jobDescription: string,
): Promise<LinkedInSuggestions> {
  const cvText = JSON.stringify(optimizedCv, null, 2);
  const prompt = `You are a LinkedIn profile optimization expert. Respond only in English.

Return ONLY valid JSON:

{
  "headlines": ["string (max 220 chars)", "string (max 220 chars)", "string (max 220 chars)"],
  "about": "string (300-400 words, first-person LinkedIn summary)",
  "skills": ["string"]
}

--- OPTIMIZED RESUME ---
${cvText}

--- JOB DESCRIPTION ---
${jobDescription}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const text = response.choices[0].message.content ?? '';
  return JSON.parse(text) as LinkedInSuggestions;
}
