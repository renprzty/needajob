import { useEffect, useState } from "react";

const ADD_DRAFT_KEY = "job-tracker:add-application-draft";

const emptyForm = {
    company: "",
    position: "",
    location: "",
    workType: "On-site",
    status: "Saved",
    appliedDate: "",
    deadline: "",
    followUpDate: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "IDR",
    jobUrl: "",
    jobDescription: "",
    notes: "",
};

function hasDraftContent(formData) {
    return Object.entries(formData).some(
        ([key, value]) => {
            if (
                key === "workType" ||
                key === "status" ||
                key === "salaryCurrency"
            ) {
                return false;
            }

            return (
                value !== "" &&
                value !== null &&
                value !== undefined
            );
        }
    );
}

function getInitialFormData(initialData) {
    if (initialData) {
        return {
            ...emptyForm,
            ...initialData,

            appliedDate:
                initialData.appliedDate || "",

            deadline:
                initialData.deadline || "",

            followUpDate:
                initialData.followUpDate || "",

            salaryMin:
                initialData.salaryMin ?? "",

            salaryMax:
                initialData.salaryMax ?? "",

            jobDescription:
                initialData.jobDescription || "",
        };
    }

    try {
        const savedDraft =
            localStorage.getItem(
                ADD_DRAFT_KEY
            );

        if (savedDraft) {
            return {
                ...emptyForm,
                ...JSON.parse(savedDraft),
            };
        }
    } catch (error) {
        console.error(
            "Failed to restore application draft:",
            error
        );
    }

    return emptyForm;
}

function ApplicationForm({
    initialData,
    onSubmit,
    onCancel,
    title = "Add Application",
    submitLabel = "Add Application",
}) {
    const [formData, setFormData] = useState(() =>
        getInitialFormData(initialData)
    );

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            return;
        }

        try {
            if (hasDraftContent(formData)) {
                localStorage.setItem(
                    ADD_DRAFT_KEY,
                    JSON.stringify(formData)
                );
            } else {
                localStorage.removeItem(
                    ADD_DRAFT_KEY
                );
            }
        } catch (error) {
            console.error(
                "Failed to save application draft:",
                error
            );
        }
    }, [formData, initialData]);

    function handleDiscardDraft() {
        localStorage.removeItem(
            ADD_DRAFT_KEY
        );

        setFormData({
            ...emptyForm,
        });

        setErrors({});
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => {
            const updatedData = {
                ...currentData,
                [name]: value,
            };

            if (
                name === "status" &&
                value === "Applied" &&
                !currentData.appliedDate
            ) {
                updatedData.appliedDate = new Date()
                    .toISOString()
                    .split("T")[0];
            }

            return updatedData;
        });

        if (errors[name]) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                [name]: "",
            }));
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const newErrors = {};

        if (!formData.company.trim()) {
            newErrors.company = "Company is required.";
        }

        if (!formData.position.trim()) {
            newErrors.position = "Position is required.";
        }

        if (
            formData.salaryMin &&
            formData.salaryMax &&
            Number(formData.salaryMin) > Number(formData.salaryMax)
        ) {
            newErrors.salaryMax =
                "Maximum salary must be greater than minimum salary.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const applicationData = {
            ...formData,

            ...(initialData?.id && {
                id: initialData.id,
            }),

            salaryMin: formData.salaryMin
                ? Number(formData.salaryMin)
                : null,

            salaryMax: formData.salaryMax
                ? Number(formData.salaryMax)
                : null,

            appliedDate: formData.appliedDate || null,
            deadline: formData.deadline || null,
            followUpDate: formData.followUpDate || null,

            ...(initialData?.createdAt && {
                createdAt: initialData.createdAt,
            }),
        };

        await onSubmit(applicationData);

        if (!initialData) {
            localStorage.removeItem(
                ADD_DRAFT_KEY
            );
        }
    }

    return (
        <form
            className="application-form"
            onSubmit={handleSubmit}
        >
            <div className="form-header">
                <div className="form-header-title">
                    <h2>{title}</h2>
                    {!initialData &&
                        hasDraftContent(formData) && (
                            <span className="draft-indicator">
                                Draft saved
                            </span>
                        )}
                </div>
                <p>Add a job opportunity to your tracker.</p>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="company">Company *</label>
                    <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="e.g. Google"
                        value={formData.company}
                        onChange={handleChange}
                    />
                    {errors.company && (
                        <span className="form-error">
                            {errors.company}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="position">Position *</label>
                    <input
                        id="position"
                        name="position"
                        type="text"
                        placeholder="e.g. Software Engineer"
                        value={formData.position}
                        onChange={handleChange}
                    />
                    {errors.position && (
                        <span className="form-error">
                            {errors.position}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="e.g. Jakarta, Indonesia"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="workType">Work Type</label>
                    <select
                        id="workType"
                        name="workType"
                        value={formData.workType}
                        onChange={handleChange}
                    >
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="appliedDate">Applied Date</label>
                    <input
                        id="appliedDate"
                        name="appliedDate"
                        type="date"
                        value={formData.appliedDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="deadline">Application Deadline</label>
                <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="followUpDate">
                    Follow-up Date
                </label>

                <input
                    id="followUpDate"
                    name="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={handleChange}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="salaryMin">Minimum Salary</label>
                    <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        placeholder="5000000"
                        value={formData.salaryMin}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="salaryMax">Maximum Salary</label>
                    <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        placeholder="8000000"
                        value={formData.salaryMax}
                        onChange={handleChange}
                    />
                    {errors.salaryMax && (
                        <span className="form-error">
                            {errors.salaryMax}
                        </span>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="salaryCurrency">Currency</label>
                <select
                    id="salaryCurrency"
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                    <option value="MYR">MYR</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="jobUrl">Job URL</label>
                <input
                    id="jobUrl"
                    name="jobUrl"
                    type="url"
                    placeholder="https://company.com/jobs/..."
                    value={formData.jobUrl}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group form-field-full">
                <label htmlFor="jobDescription">Job Description</label>
                <textarea
                    id="jobDescription"
                    name="jobDescription"
                    rows="10"
                    placeholder="Paste the job description here..."
                    value={formData.jobDescription}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    placeholder="Anything you want to remember..."
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>

            <div className="form-actions">
                {!initialData &&
                    hasDraftContent(formData) && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleDiscardDraft}
                        >
                            Discard Draft
                        </button>
                    )}

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button type="submit" className="primary-button">
                    {submitLabel}
                </button>
            </div>
        </form>
    );

}

export default ApplicationForm;