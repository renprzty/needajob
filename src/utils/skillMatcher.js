import { SKILL_GROUPS } from "../data/skillGroups.js";
import { cleanExtractedText } from "./textCleanup.js";
import { SKILL_DICTIONARY } from "../data/skillDictionary.js";

export function getMatchLevel(score) {
  if (score === null) return { label: "Insufficient data", level: "unknown" };
  if (score >= 80) return { label: "Strong match", level: "strong" };
  if (score >= 60) return { label: "Good match", level: "good" };
  if (score >= 40) return { label: "Partial match", level: "partial" };
  return { label: "Low match", level: "low" };
}

export function buildMatchSuggestions(result) {
  if (!result) return [];
  const suggestions = [];
  const missing = result.missingSkills.length + result.missingSkillGroups.length;
  const matched = result.matchedSkills.length;
  if (result.requiredSkills.length && result.matchedRequired.length === result.requiredSkills.length && !result.missingSkillGroups.some(group => group.classification === "required")) {
    suggestions.push({ type: "required-strength", text: "All detected required skills were found in this resume." });
  }
  if (result.missingRequired.length) {
    const count = result.missingRequired.length;
    suggestions.push({ type: "missing-required", text: `${count} required skill${count === 1 ? " was" : "s were"} not detected in this resume.` });
  }
  if (result.missingSkillGroups.length) suggestions.push({ type: "missing-groups", text: "Some detected skill groups were not found in this resume: " + result.missingSkillGroups.map(group => group.label).join(", ") + "." });
  if (missing) suggestions.push({ type: "missing-skills", text: `${missing} job skill${missing === 1 ? " was" : "s were"} not detected in this resume.` });
  if (matched) suggestions.push({ type: "strength", text: `${matched} relevant skill${matched === 1 ? " was" : "s were"} found in both the job description and resume.` });
  if (missing) suggestions.push({ type: "review", text: "Review the missing skills and only add them if you genuinely have that experience." });
  return suggestions;
}

function normalizeText(text) {
  return String(text || "").toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, " ").trim();
}

function aliasPattern(alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])(${escaped.replace(/ /g, "\\s+")})(?=[^a-z0-9]|$)`, "i");
}

export function extractSkills(text) {
  const normalized = normalizeText(cleanExtractedText(text));
  const skills = [];
  for (const [key, definition] of Object.entries(SKILL_DICTIONARY)) {
    const matchedAlias = definition.aliases.find((alias) => aliasPattern(alias).test(normalized));
    if (matchedAlias) skills.push({ key, label: definition.label, matchedAlias });
  }
  return skills;
}

export function compareResumeToJob({ resumeText, jobDescription }) {
  const resumeSkills = extractSkills(resumeText);
  const { requiredSkills, preferredSkills, allSkills: jobSkills, skillGroups: detectedGroups } = extractJobSkills(jobDescription);
  const resumeKeys = new Set(resumeSkills.map((skill) => skill.key));
  const matchedRequired = requiredSkills.filter((skill) => resumeKeys.has(skill.key));
  const missingRequired = requiredSkills.filter((skill) => !resumeKeys.has(skill.key));
  const matchedPreferred = preferredSkills.filter((skill) => resumeKeys.has(skill.key));
  const missingPreferred = preferredSkills.filter((skill) => !resumeKeys.has(skill.key));
  const skillGroups = detectedGroups.map(group => {
    const matchedMembers = group.members.filter(key => resumeKeys.has(key));
    return { ...group, matched: matchedMembers.length > 0, matchedMembers, matchedLabels: matchedMembers.map(key => SKILL_DICTIONARY[key].label) };
  });
  const satisfiedSkillGroups = skillGroups.filter(group => group.matched);
  const missingSkillGroups = skillGroups.filter(group => !group.matched);
  const groupWeight = group => group.classification === "preferred" ? 1 : 3;
  const totalPoints = requiredSkills.length * 3 + preferredSkills.length + skillGroups.reduce((sum, group) => sum + groupWeight(group), 0);
  const earnedPoints = matchedRequired.length * 3 + matchedPreferred.length + satisfiedSkillGroups.reduce((sum, group) => sum + groupWeight(group), 0);
  const skillScore = totalPoints ? Math.round(earnedPoints / totalPoints * 100) : null;
  const textSimilarityScore = Math.round(cosineSimilarity(resumeText, jobDescription) * 100);
  const score = skillScore === null ? textSimilarityScore : Math.round(skillScore * 0.8 + textSimilarityScore * 0.2);
  const matchedSkills = [...matchedRequired, ...matchedPreferred];
  const missingSkills = [...missingRequired, ...missingPreferred];
  const evidenceSkills = [...new Map([...matchedSkills, ...satisfiedSkillGroups.flatMap(group => group.matchedMembers.map(key => resumeSkills.find(skill => skill.key === key)))].map(skill => [skill.key, skill])).values()];
  const evidence = evidenceSkills.map((skill) => ({ skill, snippet: getEvidenceForSkill(resumeText, skill) })).filter((item) => item.snippet);
  const tokens = tokenizeText(jobDescription);
  const conceptCount = jobSkills.length + skillGroups.length;
  const detectionCoverage = tokens.length ? Math.min(100, Math.round(conceptCount / Math.max(1, Math.round(tokens.length / 25)) * 100)) : 0;
  const confidence = conceptCount >= 8 && detectionCoverage >= 70 ? { label: "High confidence", level: "high" }
    : conceptCount >= 4 ? { label: "Moderate confidence", level: "medium" } : { label: "Limited coverage", level: "low" };
  return { skillGroups, satisfiedSkillGroups, missingSkillGroups, detectionCoverage, confidence, score, skillScore, textSimilarityScore, resumeSkills, jobSkills, requiredSkills, preferredSkills,
    matchedRequired, missingRequired, matchedPreferred, missingPreferred, matchedSkills, missingSkills, evidence };
}

function splitJobDescriptionSections(jobDescription) {
  const sections = { required: [], preferred: [], general: [] };
  let section = "general";
  for (const raw of String(jobDescription || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.replace(/:$/, "").replace(/[\u2018\u2019]/g, "'").trim();
    if (/^(requirements?|what we're looking for|what we are looking for|qualifications?|required qualifications?|must[- ]have|core requirements?)$/i.test(heading)) { section = "required"; continue; }
    if (/^(preferred qualifications?|preferred skills?|nice[- ]to[- ]have|bonus skills?|bonus|desirable)$/i.test(heading)) { section = "preferred"; continue; }
    if (/^(benefits|compensation|what we offer|about us|responsibilities|how to apply)$/i.test(heading)) { section = "general"; continue; }
    const inline = line.match(/^(bonus|nice[- ]to[- ]have|preferred)\s*:\s*(.+)$/i);
    if (inline) sections.preferred.push(inline[2].trim());
    else sections[section].push(line);
  }
  return { requiredText: sections.required.join("\n"), preferredText: sections.preferred.join("\n"), generalText: sections.general.join("\n") };
}

function detectSkillGroups(line) {
  const groups = [];
  const skills = extractSkills(line);
  const frameworkKeys = SKILL_GROUPS.modernFrontendFramework.members;
  const alternatives = /\b(or|any|one of|either)\b/i.test(line);
  if (/\bmodern (?:frontend )?framework\b/i.test(line) || (alternatives && skills.filter(s => frameworkKeys.includes(s.key)).length >= 2)) groups.push("modernFrontendFramework");
  if (/\bdatabases?\b/i.test(line)) groups.push("databaseExperience");
  if (/\bcloud (basics?|experience|computing)\b/i.test(line)) groups.push("cloudExperience");
  return groups.map(key => ({ key, ...SKILL_GROUPS[key] }));
}

export function extractJobSkills(jobDescription) {
  const { requiredText, preferredText, generalText } = splitJobDescriptionSections(jobDescription);
  const required = new Map(), preferred = new Map(), groups = new Map();
  for (const [text, classification, target] of [[requiredText.trim() ? requiredText : generalText, "required", required], [preferredText, "preferred", preferred]]) {
    for (const line of text.split("\n")) {
      const lineGroups = detectSkillGroups(line);
      for (const group of lineGroups) if (!groups.has(group.key)) groups.set(group.key, { ...group, classification });
      const groupedKeys = new Set(lineGroups.flatMap(group => group.members));
      for (const skill of extractSkills(line)) if (!groupedKeys.has(skill.key)) target.set(skill.key, skill);
    }
  }
  const requiredSkills = [...required.values()];
  const preferredSkills = [...preferred.values()].filter(skill => !required.has(skill.key));
  return { requiredSkills, preferredSkills, allSkills: [...requiredSkills, ...preferredSkills], skillGroups: [...groups.values()] };
}

const STOP_WORDS = new Set("a an and are as at be by for from in is it of on or that the this to with you your we our".split(" "));

function tokenizeText(text) {
  // Preserve technical names such as node.js and C++, but discard sentence periods.
  return (normalizeText(text).match(/[a-z0-9]+(?:\.[a-z0-9]+)*(?:\+\+|#)?/g) || [])
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function getTermFrequency(tokens) {
  const frequency = new Map();
  for (const token of tokens) frequency.set(token, (frequency.get(token) || 0) + 1);
  return frequency;
}

function cosineSimilarity(firstText, secondText) {
  const first = getTermFrequency(tokenizeText(firstText));
  const second = getTermFrequency(tokenizeText(secondText));
  let dot = 0, firstMagnitude = 0, secondMagnitude = 0;
  for (const word of new Set([...first.keys(), ...second.keys()])) {
    const a = first.get(word) || 0, b = second.get(word) || 0;
    dot += a * b;
    firstMagnitude += a * a;
    secondMagnitude += b * b;
  }
  return firstMagnitude && secondMagnitude ? Math.min(1, dot / Math.sqrt(firstMagnitude * secondMagnitude)) : 0;
}

function getEvidenceForSkill(resumeText, skill) {
  const text = cleanExtractedText(resumeText);
  for (const alias of SKILL_DICTIONARY[skill.key].aliases) {
    const match = aliasPattern(alias).exec(text);
    if (match) {
      const index = match.index + match[1].length;
      return text.slice(Math.max(0, index - 80), Math.min(text.length, index + match[2].length + 100)).replace(/\s+/g, " ").trim();
    }
  }
  return null;
}
