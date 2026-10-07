import test from "node:test";
import assert from "node:assert/strict";
import { buildMatchSuggestions, compareResumeToJob, extractSkills, extractJobSkills, getMatchLevel } from "./skillMatcher.js";

test("report example scores 67 percent with four matched and two missing", () => {
  const result = compareResumeToJob({ resumeText: "React JavaScript Git PostgreSQL", jobDescription: "React TypeScript JavaScript Git PostgreSQL Docker" });
  assert.equal(result.skillScore, 67);
  assert.equal(result.matchedSkills.length, 4);
  assert.deepEqual(result.missingSkills.map((s) => s.key), ["typescript", "docker"]);
  assert.equal(result.jobSkills.length, 6);
});

test("different resume versions produce 40 and 80 percent against the same job", () => {
  const jobDescription = "React TypeScript PostgreSQL Docker Git";
  assert.equal(compareResumeToJob({ resumeText: "React Git", jobDescription }).skillScore, 40);
  assert.equal(compareResumeToJob({ resumeText: "React TypeScript PostgreSQL Git", jobDescription }).skillScore, 80);
});

test("match levels cover exact boundaries and unknown data", () => {
  for (const [score, level] of [[null, "unknown"], [0, "low"], [39, "low"], [40, "partial"], [59, "partial"], [60, "good"], [79, "good"], [80, "strong"], [100, "strong"]]) {
    assert.equal(getMatchLevel(score).level, level);
  }
});

test("suggestions reflect detected skills and keep advice honest", () => {
  assert.deepEqual(buildMatchSuggestions(null), []);
  assert.deepEqual(buildMatchSuggestions(compareResumeToJob({ resumeText: "React", jobDescription: "unknown" })), []);
  const result = compareResumeToJob({ resumeText: "React", jobDescription: "React Git Docker" });
  const suggestions = buildMatchSuggestions(result);
  assert.equal(suggestions.length, 4);
  assert.match(suggestions[2].text, /1 relevant skill was found/);
  assert.match(suggestions[3].text, /only add them if you genuinely have that experience/);
});

test("the checkpoint example scores 60 percent", () => {
  const result = compareResumeToJob({
    jobDescription: "React developer with TypeScript, PostgreSQL, Docker and Git experience.",
    resumeText: "Frontend developer with React, JavaScript, PostgreSQL and Git.",
  });
  assert.equal(result.skillScore, 60);
  assert.deepEqual(result.matchedSkills.map((s) => s.key), ["react", "postgres", "git"]);
  assert.deepEqual(result.missingSkills.map((s) => s.key), ["typescript", "docker"]);
});

test("aliases, punctuation, casing and whitespace normalize consistently", () => {
  const skills = extractSkills("REACTJS, Node.js; C# / C++, Amazon\nWeb Services, RESTful   API");
  assert.deepEqual(skills.map((s) => s.key), ["react", "nodejs", "csharp", "cpp", "aws", "restApi"]);
  assert.equal(skills[0].matchedAlias, "reactjs");
});

test("substrings do not manufacture skills", () => {
  assert.deepEqual(extractSkills("JavaScript GitHub MySQL PostgreSQL reactive").map((s) => s.key),
    ["javascript", "postgres", "mysql", "github"]);
});

test("repeated skills count once and unrelated resume skills do not increase the score", () => {
  const result = compareResumeToJob({ resumeText: "React reactjs Python", jobDescription: "React React Docker" });
  assert.equal(result.skillScore, 50);
  assert.equal(result.jobSkills.length, 2);
});

test("unknown job skills produce no score; an empty resume scores zero", () => {
  assert.equal(compareResumeToJob({ resumeText: "React", jobDescription: "" }).skillScore, null);
  assert.equal(compareResumeToJob({ resumeText: null, jobDescription: "React" }).score, 0);
  assert.deepEqual(extractSkills(undefined), []);
});

test("required skills carry triple weight and duplicate preferred skills are removed", () => {
  const jobDescription = 'Required:\nReact JavaScript Git PostgreSQL\nNice to have:\nDocker AWS React';
  const result = compareResumeToJob({ resumeText: 'React JavaScript Git PostgreSQL', jobDescription });
  assert.equal(result.skillScore, 86);
  assert.equal(result.requiredSkills.length, 4);
  assert.equal(result.preferredSkills.length, 2);
  assert.equal(result.missingRequired.length, 0);
  assert.equal(result.score, Math.round(86 * .8 + result.textSimilarityScore * .2));
  assert.equal(buildMatchSuggestions(result)[0].type, 'required-strength');
});

test("all preferred markers classify skills, with required as the default", () => {
  for (const marker of ['preferred qualifications', 'nice to have', 'nice-to-have', 'preferred skills', 'bonus', 'desirable']) {
    const result = extractJobSkills(`React\n${marker.toUpperCase()}:\nDocker`);
    assert.deepEqual(result.requiredSkills.map(s => s.key), ['react']);
    assert.deepEqual(result.preferredSkills.map(s => s.key), ['docker']);
  }
  assert.equal(extractJobSkills('React Docker').preferredSkills.length, 0);
  const preferredOnly = compareResumeToJob({ resumeText: 'Docker', jobDescription: 'Nice to have\nDocker AWS' });
  assert.equal(preferredOnly.skillScore, 50);
  assert.ok(!buildMatchSuggestions(preferredOnly).some(s => s.type === 'required-strength'));
});

test("text similarity handles punctuation, stop words, empty and unrelated text", () => {
  const compare = (resumeText, jobDescription) => compareResumeToJob({ resumeText, jobDescription });
  assert.equal(compare('customer support.', 'Customer support').textSimilarityScore, 100);
  assert.equal(compare('customer support', 'data analysis').score, 0);
  assert.equal(compare('the and our', 'customer support').score, 0);
  assert.equal(compare('', '').score, 0);
  assert.equal(compare('customer support', 'customer support').skillScore, null);
  assert.equal(compare('customer support', 'customer support').score, 100);
});

test("evidence includes plural REST APIs and original case", () => {
  const resumeText = 'Built a React dashboard connected to PostgreSQL using REST APIs.';
  const result = compareResumeToJob({ resumeText, jobDescription: 'React PostgreSQL REST API' });
  assert.equal(result.evidence.length, 3);
  for (const item of result.evidence) assert.equal(item.snippet, resumeText);
});

test("evidence obeys word boundaries and multiline aliases", () => {
  const resumeText = 'JavaScript ' + 'x'.repeat(220) + ' Java experience with Amazon\nWeb Services.';
  const result = compareResumeToJob({ resumeText, jobDescription: 'Java AWS Docker' });
  assert.equal(result.evidence.length, 2);
  assert.ok(!result.evidence[0].snippet.includes('JavaScript'));
  assert.match(result.evidence[1].snippet, /Amazon Web Services/);
  assert.ok(result.evidence.every(item => item.skill.key !== 'docker'));
});

test("AICines-style sections keep required lines after inline bonus and avoid double counting", () => {
  const jobDescription = `Performance bonus: tied to milestones
What we\u2019re looking for:
Working knowledge of HTML, CSS and JavaScript
Any modern framework � React, Next.js, Vue, Angular
Bonus: Node, Python, databases, or cloud basics
A GitHub or shipped projects`;
  const result = compareResumeToJob({jobDescription, resumeText:'HTML CSS JavaScript React Vue Node Python GitHub PostgreSQL MySQL Supabase'});
  assert.deepEqual(result.requiredSkills.map(s=>s.key), ['javascript','html','css','github']);
  assert.equal(result.missingRequired.length,0);
  assert.equal(result.skillGroups.length,3);
  assert.equal(result.skillGroups.find(g=>g.key==='databaseExperience').classification,'preferred');
  assert.equal(result.skillGroups.find(g=>g.key==='modernFrontendFramework').classification,'required');
  assert.deepEqual(result.skillGroups.find(g=>g.key==='modernFrontendFramework').matchedLabels,['React','Vue']);
  assert.deepEqual(result.missingSkillGroups.map(g=>g.key),['cloudExperience']);
  assert.equal(result.skillScore,95);
  assert.ok(result.evidence.some(e=>e.skill.key==='postgres'));
});

test("AND frameworks remain standalone; explicit React elsewhere remains required",()=> {
  assert.equal(extractJobSkills('Requirements\nReact and Vue and Angular').skillGroups.length,0);
  const data=extractJobSkills('Requirements\nAny modern framework React or Vue\nReact experience required');
  assert.deepEqual(data.requiredSkills.map(s=>s.key),['react']);
  assert.equal(data.skillGroups.length,1);
});

test("sections switch back to required and support curly apostrophes",()=> {
  const data=extractJobSkills('Preferred skills:\nAWS\nWhat we\u2019re looking for:\nHTML CSS\nBonus: Python\nGitHub');
  assert.deepEqual(data.requiredSkills.map(s=>s.key),['html','css','github']);
  assert.deepEqual(data.preferredSkills.map(s=>s.key),['aws','python']);
});

test("generic database/cloud groups are satisfied by specific experience",()=> {
  const result=compareResumeToJob({jobDescription:'Requirements\nDatabase systems\nCloud basics',resumeText:'PostgreSQL AWS'});
  assert.equal(result.skillScore,100);
  assert.equal(result.satisfiedSkillGroups.length,2);
  assert.equal(result.jobSkills.length,0);
  assert.equal(result.confidence.level,'low');
});

test("coverage is bounded and distinguishes empty and well detected postings",()=> {
  const empty=compareResumeToJob({resumeText:'',jobDescription:''});
  assert.equal(empty.detectionCoverage,0);
  assert.equal(empty.confidence.level,'low');
  const full=compareResumeToJob({resumeText:'',jobDescription:'HTML CSS JavaScript Git GitHub Docker Python Java'});
  assert.equal(full.detectionCoverage,100);
  assert.equal(full.confidence.level,'high');
});
