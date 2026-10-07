import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CollapsibleCard from "./CollapsibleCard";

export default function ResumePerformance({ data }) {
  return (
    <CollapsibleCard title="Resume Performance" eyebrow="Documents" className="resume-performance aero-panel" defaultExpanded={false}>
      <p className="resume-performance-description">Compare outcomes for the resume versions you've used.</p>

      {data.length === 0 ? (
        <div className="resume-performance-empty">
          <p>
            Attach resume versions to applications to start seeing performance
            data.
          </p>
        </div>
      ) : (
        <>
          <div className="resume-performance-chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} />

                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />

                <Tooltip formatter={(value) => `${value}%`} />

                <Legend />

                <Bar
                  dataKey="interviewRate"
                  name="Interview Rate"
                  fill="#1694d8"
                  radius={[7, 7, 0, 0]}
                />

                <Bar
                  dataKey="offerRate"
                  name="Offer Rate"
                  fill="#1bb28a"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="resume-performance-table">
            <div className="resume-performance-header">
              <span>Resume</span>
              <span>Apps</span>
              <span>Interviews</span>
              <span>Interview Rate</span>
              <span>Offers</span>
              <span>Offer Rate</span>
            </div>

            {data.map((resume) => (
              <div key={resume.documentId} className="resume-performance-row">
                <div>
                  <strong>{resume.name}</strong>
                  {resume.versionLabel && <span>{resume.versionLabel}</span>}
                  {resume.applications < 5 && (
                    <span className="sample-size-warning">Limited data</span>
                  )}
                </div>

                <span>{resume.applications}</span>
                <span>{resume.interviews}</span>
                <span>{resume.interviewRate}%</span>
                <span>{resume.offers}</span>
                <span>{resume.offerRate}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </CollapsibleCard>
  );
}
