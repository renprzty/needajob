import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartDefs() {
  return (
    <defs>
      {/* Area Gradient (Luminous Sky & Cyan Glass Water) */}
      <linearGradient id="aeroAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.82} />
        <stop offset="35%" stopColor="#0ea5e9" stopOpacity={0.5} />
        <stop offset="70%" stopColor="#2dd4bf" stopOpacity={0.2} />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
      </linearGradient>

      {/* Luminous Curve Stroke Gradient */}
      <linearGradient id="aeroLineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>

      {/* Glow Filter for Curve Line */}
      <filter id="aeroGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.4" />
      </filter>

      {/* Bar Shadow Filter */}
      <filter id="aeroBarShadow" x="-10%" y="-20%" width="120%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#075985" floodOpacity="0.25" />
      </filter>

      {/* 3D Cylindrical Gel Bar Gradients (Light on top, saturated core, shaded base) */}
      {/* 1. Applied: Royal Cerulean Gel */}
      <linearGradient id="barGradApplied" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="25%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>

      {/* 2. Interview: Emerald Crystal Gel */}
      <linearGradient id="barGradInterview" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bbf7d0" />
        <stop offset="25%" stopColor="#4ade80" />
        <stop offset="60%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>

      {/* 3. Offer: Golden Sun Amber Gel */}
      <linearGradient id="barGradOffer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="25%" stopColor="#facc15" />
        <stop offset="60%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>

      {/* 4. Assessment: Aqua Cyan Gel */}
      <linearGradient id="barGradAssessment" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="25%" stopColor="#22d3ee" />
        <stop offset="60%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#0e7490" />
      </linearGradient>

      {/* 5. Saved: Azure Sky Gel */}
      <linearGradient id="barGradSaved" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="25%" stopColor="#7dd3fc" />
        <stop offset="60%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      {/* 6. Rejected / Terminal: Coral Ruby Gel */}
      <linearGradient id="barGradTerminal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="25%" stopColor="#fb923c" />
        <stop offset="60%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>

      <linearGradient id="barGradDefault" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="25%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
  );
}

function getStatusBarGradient(status) {
  switch (status) {
    case "Applied":
      return "url(#barGradApplied)";
    case "Interview":
      return "url(#barGradInterview)";
    case "Offer":
      return "url(#barGradOffer)";
    case "Assessment":
      return "url(#barGradAssessment)";
    case "Saved":
      return "url(#barGradSaved)";
    case "Rejected":
    case "Withdrawn":
      return "url(#barGradTerminal)";
    default:
      return "url(#barGradDefault)";
  }
}

function AreaTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const count = payload[0].value;
    return (
      <div className="aero-chart-tooltip">
        <span className="aero-tooltip-label">Week of {label}</span>
        <strong className="aero-tooltip-value">
          {count} {count === 1 ? "application" : "applications"}
        </strong>
      </div>
    );
  }
  return null;
}

function BarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="aero-chart-tooltip">
        <span className="aero-tooltip-label">{data.status}</span>
        <strong className="aero-tooltip-value">
          {data.count} {data.count === 1 ? "application" : "applications"}
        </strong>
      </div>
    );
  }
  return null;
}

export default function AnalyticsTrends({
  applicationTrend,
  statusDistribution,
}) {
  return (
    <div className="analytics-trends-grid">
      {/* Applications Over Time Chart */}
      <section className="analytics-chart-card aero-panel">
        <div className="analytics-chart-header">
          <div>
            <span className="section-eyebrow">Trend</span>
            <h2>Applications Over Time</h2>
          </div>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={applicationTrend}
              margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            >
              <ChartDefs />

              <CartesianGrid
                stroke="#38bdf8"
                strokeDasharray="3 3"
                opacity={0.18}
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fill: "#64879d", fontSize: 11, fontWeight: 600 }}
                stroke="#94c5db"
                strokeOpacity={0.6}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64879d", fontSize: 11, fontWeight: 600 }}
                stroke="#94c5db"
                strokeOpacity={0.6}
                tickLine={false}
              />

              <Tooltip content={<AreaTooltip />} />

              <Area
                type="monotone"
                dataKey="applications"
                stroke="url(#aeroLineGrad)"
                strokeWidth={3.5}
                fill="url(#aeroAreaGrad)"
                filter="url(#aeroGlowFilter)"
                dot={{
                  r: 4.5,
                  fill: "#ffffff",
                  stroke: "#0284c7",
                  strokeWidth: 2.2,
                }}
                activeDot={{
                  r: 6.5,
                  fill: "#38bdf8",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Applications by Status Chart */}
      <section className="analytics-chart-card aero-panel">
        <div className="analytics-chart-header">
          <div>
            <span className="section-eyebrow">Distribution</span>
            <h2>Applications by Status</h2>
          </div>
        </div>

        <div className="analytics-chart">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={statusDistribution}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <ChartDefs />

              <CartesianGrid
                stroke="#38bdf8"
                strokeDasharray="3 3"
                opacity={0.18}
                horizontal={false}
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "#64879d", fontSize: 11, fontWeight: 600 }}
                stroke="#94c5db"
                strokeOpacity={0.6}
                tickLine={false}
              />

              <YAxis
                dataKey="status"
                type="category"
                width={90}
                tick={{ fill: "#17364a", fontSize: 12, fontWeight: 700 }}
                stroke="#94c5db"
                strokeOpacity={0.6}
                tickLine={false}
              />

              <Tooltip content={<BarTooltip />} />

              <Bar
                dataKey="count"
                radius={[0, 12, 12, 0]}
                stroke="#ffffff"
                strokeWidth={1.2}
                filter="url(#aeroBarShadow)"
                barSize={24}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell
                    key={`status-cell-${index}`}
                    fill={getStatusBarGradient(entry.status)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
