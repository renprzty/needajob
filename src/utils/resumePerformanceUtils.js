const INTERVIEW_REACHED_STATUSES = [
  "Interview",
  "Offer",
];

const OFFER_REACHED_STATUSES = [
  "Offer",
];

export function buildResumePerformance({
  documents,
  links,
  applications,
  activities = [],
}) {
  const applicationById = new Map(
    applications.map((application) => [application.id, application])
  );

  const reachedInterview = new Set();
  const reachedOffer = new Set();

  for (const activity of activities) {
    if (activity.activityType !== "status_changed") {
      continue;
    }

    if (activity.newValue === "Interview") {
      reachedInterview.add(activity.applicationId);
    }

    if (activity.newValue === "Offer") {
      reachedOffer.add(activity.applicationId);
      reachedInterview.add(activity.applicationId);
    }
  }

  for (const application of applications) {
    if (INTERVIEW_REACHED_STATUSES.includes(application.status)) {
      reachedInterview.add(application.id);
    }

    if (OFFER_REACHED_STATUSES.includes(application.status)) {
      reachedOffer.add(application.id);
    }
  }

  const linksByDocument = new Map();

  for (const link of links) {
    if (!linksByDocument.has(link.documentId)) {
      linksByDocument.set(link.documentId, new Set());
    }

    linksByDocument.get(link.documentId).add(link.applicationId);
  }

  return documents
    .filter((document) => document.documentType === "resume")
    .map((document) => {
      const applicationIds =
        linksByDocument.get(document.id) || new Set();

      const validApplicationIds = [...applicationIds].filter((applicationId) =>
        applicationById.has(applicationId)
      );

      const applicationCount = validApplicationIds.length;

      const interviewCount = validApplicationIds.filter((applicationId) =>
        reachedInterview.has(applicationId)
      ).length;

      const offerCount = validApplicationIds.filter((applicationId) =>
        reachedOffer.has(applicationId)
      ).length;

      return {
        documentId: document.id,
        name: document.name,
        versionLabel: document.versionLabel,
        applications: applicationCount,
        interviews: interviewCount,
        offers: offerCount,
        interviewRate:
          applicationCount > 0
            ? Math.round((interviewCount / applicationCount) * 100)
            : 0,
        offerRate:
          applicationCount > 0
            ? Math.round((offerCount / applicationCount) * 100)
            : 0,
      };
    })
    .sort(
      (a, b) =>
        b.interviewRate - a.interviewRate ||
        b.applications - a.applications
    );
}
