import { buildMatchSuggestions, getMatchLevel } from "../utils/skillMatcher";

export default function ResumeMatchReport({ result, resume, onChangeResume }) {
  if (!result || !resume) return null;
  const { score, matchedSkills, missingSkills, jobSkills } = result;
  const matchLevel = getMatchLevel(score);
  const suggestions = buildMatchSuggestions(result);

  return (
    <section className="resume-match-report aero-panel" aria-label="Resume match report">
      <div className="resume-match-header">
        <div className="resume-match-overview">
          <p>Compared against the saved job description.</p>
          <div className="resume-match-metrics">
          <div className="resume-match-score-breakdown">
            <span>Skills <strong>{result.skillScore === null ? "\u2014" : `${result.skillScore}%`}</strong></span>
            <span>Text similarity <strong>{result.textSimilarityScore}%</strong></span>
          </div>
          <div className="resume-match-confidence">
            <span>{result.confidence.label}</span><span>Detection coverage: {result.detectionCoverage}%</span>
          </div>
          </div>
        </div>
        <div className="resume-match-score" aria-live="polite">
          <strong>{score === null ? "—" : `${score}%`}</strong>
          <span>Resume alignment</span>
          <span className={`resume-match-level is-${matchLevel.level}`}>{matchLevel.label}</span>
        </div>
      </div>
      <p className="resume-match-disclaimer">Coverage and confidence are approximate dictionary detection heuristics.</p>
      <p className="resume-match-disclaimer">{result.skillScore === null
        ? "No dictionary skills detected; this score uses text similarity only."
        : "80% weighted skills + 20% text similarity. Required skills count three times as much as preferred skills. Section classification is heuristic."}</p>
      {jobSkills.length + result.skillGroups.length === 0 ? (
        <div className="resume-match-empty"><p>No recognized skills were found in this job description yet.</p></div>
      ) : (
        <>
          <div className="resume-match-summary">
            <span>{matchedSkills.length} matched</span>
            <span>{missingSkills.length} missing</span>
            <span>{jobSkills.length + result.skillGroups.length} detected</span>
          </div>
          <div className="resume-match-columns">
            {[
              ["Required Matches", result.matchedRequired, "is-matched", "\u2713", "No required matches detected."],
              ["Missing Required", result.missingRequired, "is-missing", "\u25cb", "No missing required skills detected."],
              ["Preferred Matches", result.matchedPreferred, "is-preferred", "\u2713", "No preferred matches detected."],
              ["Missing Preferred", result.missingPreferred, "is-preferred-missing", "\u25cb", "No missing preferred skills detected."],
            ].map(([title, skills, className, symbol, emptyText]) => (
              <div key={title} className="resume-match-group">
                <h3>{title}</h3>
                {skills.length ? <div className="resume-skill-list">{skills.map((skill) => (
                  <span key={skill.key} className={`resume-skill-chip ${className}`}>{symbol} {skill.label}</span>
                ))}</div> : <p className="resume-match-muted">{emptyText}</p>}
              </div>
            ))}
          </div>
        </>
      )}
      {result.skillGroups.length > 0 && (
        <div className="resume-match-group resume-requirement-groups">
          <h3>Requirement Groups</h3>
          <div className="resume-skill-list">{result.skillGroups.map(group => (
            <span key={group.key} className={`resume-skill-chip ${group.matched ? "is-matched" : "is-missing"}`}>
              {group.matched ? "\u2713" : "\u25cb"} {group.label} ({group.classification})
              {group.matchedLabels.length > 0 && <small>via {group.matchedLabels.join(", ")}</small>}
            </span>
          ))}</div>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="resume-match-insights">
          <h3>Match Insights</h3>
          {suggestions.map((suggestion) => <div key={suggestion.type} className="resume-match-insight">{suggestion.text}</div>)}
        </div>
      )}
      {result.evidence.length > 0 && (
        <div className="resume-match-evidence">
          <h3>Resume Evidence</h3>
          <p className="resume-match-muted">Examples of where matched skills were found in this resume.</p>
          <div className="resume-evidence-list">
            {result.evidence.map(({ skill, snippet }) => (
              <article key={skill.key} className="resume-evidence-card">
                <strong>{skill.label}</strong><p>{"\u201c"}{snippet}{"\u201d"}</p>
              </article>
            ))}
          </div>
        </div>
      )}
      <div className="resume-match-footer">
        <div><span>Compared with</span><strong>{resume.name}{resume.versionLabel ? ` · ${resume.versionLabel}` : ""}</strong></div>
        {onChangeResume && <button type="button" className="secondary-button" onClick={onChangeResume}>Compare another resume</button>}
      </div>
      <p className="resume-match-disclaimer">This score is based on detected skills, keywords, and text similarity. It does not assess your actual proficiency or predict hiring outcomes.</p>
    </section>
  );
}
