import CollapsibleCard from "../components/CollapsibleCard";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import formatDate from "../utils/formatDate";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../components/Modal";
import ApplicationForm from "../components/ApplicationForm";
import ActivityTimeline from "../components/ActivityTimeline";
import ApplicationDocuments from "../components/ApplicationDocuments";
import { getApplicationActivities } from "../services/activityService";
import { getApplicationLinkedDocuments } from "../services/documentLibraryService";
import { compareResumeToJob } from "../utils/skillMatcher";
import ResumeMatchReport from "../components/ResumeMatchReport";

function ApplicationDetails({
    applications,
    user,
    onUpdateApplication,
    onDeleteApplication,
}) {
    const { id } = useParams();

    const [isEditModalOpen, setIsEditModalOpen] =
        useState(false);

    const application = applications.find(
        (application) => String(application.id) === id
    );

    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] =
        useState(false);

    const [activities, setActivities] = useState([]);
    const [activityRefreshKey, setActivityRefreshKey] = useState(0);
    const [matchData, setMatchData] = useState({ applicationId: null, refreshKey: -1, resumes: [], error: null });
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const resumeSelectorRef = useRef(null);
    const applicationId = application?.id;

    useEffect(() => {
        if (!applicationId) return;
        let cancelled = false;
        getApplicationLinkedDocuments(applicationId).then((linked) => {
            if (cancelled) return;
            const resumes = linked.map((item) => item.document).filter((document) =>
                document?.documentType === "resume" && document.extractedText?.trim()
            );
            setMatchData({ applicationId, refreshKey: activityRefreshKey, resumes, error: null });
            setSelectedResumeId((current) => resumes.some((resume) => String(resume.id) === current)
                ? current : resumes[0] ? String(resumes[0].id) : null);
        }).catch((error) => {
            if (!cancelled) setMatchData({ applicationId, refreshKey: activityRefreshKey, resumes: [], error: error.message || "Failed to load resumes for matching." });
        });
        return () => { cancelled = true; };
    }, [applicationId, activityRefreshKey]);

    const isLoadingMatchData = matchData.applicationId !== applicationId || matchData.refreshKey !== activityRefreshKey;
    const linkedResumeDocuments = matchData.resumes;
    const jobDescription = application?.jobDescription;
    const selectedResume = useMemo(() => linkedResumeDocuments.find((resume) => String(resume.id) === selectedResumeId) || null,
        [linkedResumeDocuments, selectedResumeId]);
    const matchResult = useMemo(() => {
        if (isLoadingMatchData || !selectedResume?.extractedText || !jobDescription?.trim()) return null;
        return compareResumeToJob({ resumeText: selectedResume.extractedText, jobDescription });
    }, [isLoadingMatchData, selectedResume, jobDescription]);
    const [isActivityLoading, setIsActivityLoading] = useState(true);

    async function loadActivities() {
        if (!application) {
            return;
        }

        try {
            setIsActivityLoading(true);

            const data = await getApplicationActivities(application.id);

            setActivities(data);
        } catch (error) {
            console.error("Failed to load activities:", error);
        } finally {
            setIsActivityLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application?.id]);

    async function handleDelete() {
        try {
            await onDeleteApplication(application.id);
            navigate("/applications");
        } catch (error) {
            console.error(error);
        }
    }

    if (!application) {
        return (
            <div>
                <h1>Application not found</h1>
                <p>The application you're looking for doesn't exist.</p>

                <Link to="/applications">
                    Back to Applications
                </Link>
            </div>
        );
    }

    return (
        <div className="application-details">
            <Link to="/applications" className="back-link">
                ← Back to Applications
            </Link>

            <div className="details-header">
                <div>
                    <h1>{application.position}</h1>
                    <p>{application.company}</p>
                </div>

                <StatusBadge status={application.status} />
            </div>

            <div className="details-actions">
                <button
                    className="primary-button"
                    onClick={() => setIsEditModalOpen(true)}
                >
                    Edit Application
                </button>

                <button
                    className="danger-button"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    Delete
                </button>
            </div>

            <div className="details-grid">
                <section className="details-card">
                    <h2>Job Information</h2>

                    <div className="detail-item">
                        <span>Company</span>
                        <strong>{application.company}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Position</span>
                        <strong>{application.position}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Location</span>
                        <strong>
                            {application.location || "Not specified"}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Work Type</span>
                        <strong>{application.workType}</strong>
                    </div>
                </section>

                <section className="details-card">
                    <h2>Application Information</h2>

                    <div className="detail-item">
                        <span>Status</span>
                        <strong>{application.status}</strong>
                    </div>

                    <div className="detail-item">
                        <span>Applied</span>
                        <strong>
                            {application.appliedDate
                                ? formatDate(application.appliedDate)
                                : "Not applied yet"}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span>Deadline</span>
                        <strong>
                            {application.deadline
                                ? formatDate(application.deadline)
                                : "Not specified"}
                        </strong>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Follow-up</span>
                        <strong>
                            {application.followUpDate
                                ? formatDate(application.followUpDate)
                                : "Not scheduled"}
                        </strong>
                    </div>
                </section>
            </div>

            <section className="details-card">
                <h2>Notes</h2>

                <p>
                    {application.notes || "No notes added."}
                </p>
            </section>

            <ApplicationDocuments
                application={application}
                user={user}
                onDocumentsChanged={() => {
                    loadActivities();
                    setActivityRefreshKey((current) => current + 1);
                }}
            />

            {application.jobDescription && (
                <CollapsibleCard title="Job Description" className="details-card aero-panel application-detail-section" defaultExpanded={false}>

                    <div className="job-description-content">
                        {application.jobDescription}
                    </div>
                </CollapsibleCard>
            )}

            <CollapsibleCard title="Resume Match" className="application-match-section aero-panel match-collapsible-card" defaultExpanded={false}>
                {!application.jobDescription?.trim() ? (
                    <div className="resume-match-state aero-panel"><h3>Add a job description first</h3><p>Edit this application and paste the original job description to enable matching.</p></div>
                ) : isLoadingMatchData ? (
                    <div className="resume-match-state aero-panel" role="status"><p>Preparing match...</p></div>
                ) : matchData.error ? (
                    <div className="resume-match-state aero-panel"><p role="alert">{matchData.error}</p><button type="button" className="secondary-button" onClick={() => setActivityRefreshKey((current) => current + 1)}>Retry</button></div>
                ) : linkedResumeDocuments.length === 0 ? (
                    <div className="resume-match-state aero-panel"><h3>No match-ready resume</h3><p>Attach a resume with extracted text to this application first. Use Extract Text in the Document Library if needed.</p><Link to="/documents">Open Document Library</Link></div>
                ) : (
                    <>
                        {linkedResumeDocuments.length > 1 && (
                            <label className="resume-match-selector"><span>Compare resume</span>
                                <select ref={resumeSelectorRef} value={selectedResumeId || ""} onChange={(event) => setSelectedResumeId(event.target.value)}>
                                    {linkedResumeDocuments.map((resume) => <option key={resume.id} value={String(resume.id)}>{resume.name}{resume.versionLabel ? ` · ${resume.versionLabel}` : ""}</option>)}
                                </select>
                            </label>
                        )}
                        <ResumeMatchReport result={matchResult} resume={selectedResume}
                            onChangeResume={linkedResumeDocuments.length > 1 ? () => resumeSelectorRef.current?.focus() : undefined} />
                    </>
                )}
            </CollapsibleCard>

            <section className="details-card activity-section">
                <div className="activity-section-header"><div><h2>Activity</h2><p>History of changes to this application.</p></div></div>
                <ActivityTimeline activities={activities} isLoading={isActivityLoading} />
            </section>

            {application.jobUrl && (
                <section className="details-card">
                    <h2>Job Posting</h2>

                    <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open original job posting ↗
                    </a>
                </section>
            )}

            {isEditModalOpen && (
                <Modal
                    onClose={() => setIsEditModalOpen(false)}
                >
                    <ApplicationForm
                        initialData={application}
                        title="Edit Application"
                        submitLabel="Save Changes"
                        onSubmit={async (updatedApplication) => {
                            try {
                                await onUpdateApplication(updatedApplication);
                                await loadActivities();
                                setIsEditModalOpen(false);
                            } catch (error) {
                                console.error(error);
                            }
                        }}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal
                    onClose={() => setIsDeleteModalOpen(false)}
                >
                    <div className="delete-confirmation">
                        <h2>Delete Application?</h2>

                        <p>
                            Are you sure you want to delete your application
                            for <strong>{application.position}</strong> at{" "}
                            <strong>{application.company}</strong>?
                        </p>

                        <p className="delete-warning">
                            This will also remove its activity history, document links, and calendar reminders. This cannot be undone.
                        </p>

                        <div className="form-actions">
                            <button
                                className="secondary-button"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-confirm-button"
                                onClick={handleDelete}
                            >
                                Delete Application
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ApplicationDetails;
