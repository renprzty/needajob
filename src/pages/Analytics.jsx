import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getUserActivities,
} from "../services/activityService";

import {
  getReachedApplicationIds,
  getConversionRate,
  getAverageDaysToInterview,
} from "../utils/analyticsUtils";

import AnalyticsTrends from "../components/AnalyticsTrends";

import {
  getApplicationsByWeek,
  getStatusDistribution,
} from "../utils/analyticsTrendUtils";

import {
  getAllDocumentLinks,
  getDocuments,
} from "../services/documentLibraryService";

import {
  buildResumePerformance,
} from "../utils/resumePerformanceUtils";

import ResumePerformance from "../components/ResumePerformance";

function Analytics({
  applications,
  user,
}) {
  const [activities, setActivities] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [documentLinks, setDocumentLinks] =
    useState([]);

  const [
    isInitialLoading,
    setIsInitialLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    hasLoadedActivities,
    setHasLoadedActivities,
  ] = useState(false);

  const applicationVersion =
    applications
      .map(
        (application) =>
          `${application.id}:${application.status}:${application.appliedDate}`
      )
      .join("|");

  useEffect(() => {
    async function loadActivities() {
      if (!user?.id) {
        return;
      }

      try {
        if (!hasLoadedActivities) {
          setIsInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const data =
          await getUserActivities(
            user.id
          );

        setActivities(data);
        setHasLoadedActivities(true);
      } catch (error) {
        console.error(
          "Failed to load analytics:",
          error
        );
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }

    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, applicationVersion]);

  useEffect(() => {
    async function loadDocumentAnalytics() {
      if (!user?.id) {
        return;
      }

      try {
        const [
          documentData,
          linkData,
        ] = await Promise.all([
          getDocuments(),
          getAllDocumentLinks(),
        ]);

        setDocuments(
          documentData
        );

        setDocumentLinks(
          linkData
        );
      } catch (error) {
        console.error(
          "Failed to load document analytics:",
          error
        );
      }
    }

    loadDocumentAnalytics();
  }, [
    user?.id,
    applications,
  ]);

  const analytics = useMemo(() => {
    const appliedApplications =
      applications.filter(
        (application) =>
          application.appliedDate
      );

    const assessmentIds =
      getReachedApplicationIds(
        applications,
        activities,
        "Assessment"
      );

    const interviewIds =
      getReachedApplicationIds(
        applications,
        activities,
        "Interview"
      );

    const offerIds =
      getReachedApplicationIds(
        applications,
        activities,
        "Offer"
      );

    const appliedCount =
      appliedApplications.length;

    const assessmentCount =
      assessmentIds.size;

    const interviewCount =
      interviewIds.size;

    const offerCount =
      offerIds.size;

    return {
      totalTracked: applications.length,

      appliedCount,
      assessmentCount,
      interviewCount,
      offerCount,

      interviewRate:
        getConversionRate(
          interviewCount,
          appliedCount
        ),

      offerRate:
        getConversionRate(
          offerCount,
          appliedCount
        ),

      averageDaysToInterview:
        getAverageDaysToInterview(
          applications,
          activities
        ),
    };
  }, [applications, activities]);

  const resumePerformance =
    useMemo(
      () =>
        buildResumePerformance({
          documents,
          links:
            documentLinks,
          applications,
          activities,
        }),
      [
        documents,
        documentLinks,
        applications,
        activities,
      ]
    );

  const applicationTrend = useMemo(
    () => getApplicationsByWeek(applications, 8),
    [applications]
  );

  const statusDistribution = useMemo(
    () => getStatusDistribution(applications),
    [applications]
  );

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <div className="analytics-title-row">
            <h1>Analytics</h1>

            {isRefreshing && (
              <span className="refresh-indicator">
                Syncing...
              </span>
            )}
          </div>

          <p>
            Understand how your job search
            is progressing.
          </p>
        </div>
      </div>

      {isInitialLoading && !hasLoadedActivities ? (
        <p role="status">Loading analytics...</p>
      ) : (
        <>
      <div className="analytics-stats">
        <MetricCard
          label="Tracked Jobs"
          value={analytics.totalTracked}
        />

        <MetricCard
          label="Applications Sent"
          value={analytics.appliedCount}
        />

        <MetricCard
          label="Interview Rate"
          value={`${analytics.interviewRate}%`}
        />

        <MetricCard
          label="Offer Rate"
          value={`${analytics.offerRate}%`}
        />

        <MetricCard
          label="Avg. Time to Interview"
          value={
            analytics.averageDaysToInterview
              === null
              ? "—"
              : `${analytics.averageDaysToInterview} days`
          }
        />
      </div>

      <AnalyticsTrends
        applicationTrend={applicationTrend}
        statusDistribution={statusDistribution}
      />

      <ResumePerformance
        data={resumePerformance}
      />

      <PipelineAnalytics
        analytics={analytics}
      />
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="analytics-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PipelineAnalytics({
  analytics,
}) {
  const stages = [
    {
      name: "Applied",
      value: analytics.appliedCount,
    },
    {
      name: "Assessment",
      value: analytics.assessmentCount,
    },
    {
      name: "Interview",
      value: analytics.interviewCount,
    },
    {
      name: "Offer",
      value: analytics.offerCount,
    },
  ];

  const maximum =
    Math.max(
      analytics.appliedCount,
      1
    );

  return (
    <section className="analytics-panel">
      <div className="analytics-panel-header">
        <h2>Application Funnel</h2>

        <p>
          How far your applications
          progress through the pipeline.
        </p>
      </div>

      <div className="funnel-chart">
        {stages.map((stage) => {
          const percentage =
            (stage.value / maximum) *
            100;

          return (
            <div
              key={stage.name}
              className="funnel-row"
            >
              <div className="funnel-label">
                <span>
                  {stage.name}
                </span>

                <strong>
                  {stage.value}
                </strong>
              </div>

              <div className="funnel-track">
                <div
                  className="funnel-fill"
                  style={{
                    width:
                      `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Analytics;
