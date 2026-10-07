import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";

import { supabase } from "./lib/supabaseClient";
import ApplicationDetails from "./pages/ApplicationDetails";
import Pipeline from "./pages/Pipeline";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import {
  getApplications,
  createApplication,
  updateApplication as updateApplicationInDatabase,
  deleteApplication as deleteApplicationFromDatabase,
  deleteApplications as deleteApplicationsFromDatabase,
  archiveApplication as archiveApplicationInDatabase,
  restoreApplication as restoreApplicationInDatabase,
  archiveApplications as archiveApplicationsInDatabase,
  restoreApplications as restoreApplicationsInDatabase,
} from "./services/applicationService";
import { getProfile } from "./services/profileService";

function mergeUpdatedApplications(
  currentApplications,
  updatedApplications
) {
  const updatedById = new Map(
    updatedApplications.map(
      (application) => [
        application.id,
        application,
      ]
    )
  );

  return currentApplications.map(
    (application) =>
      updatedById.get(application.id) ??
      application
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setIsAuthLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        setUser(session?.user ?? null);
        setIsAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadApplications() {
      if (!user?.id) {
        setApplications([]);
        return;
      }

      try {
        setError(null);

        if (applications.length === 0) {
          setIsInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const data = await getApplications(user.id);

        setApplications(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load applications.");
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    loadProfile();
  }, [user?.id]);

  async function addApplication(newApplication) {
    try {
      setError(null);

      const createdApplication =
        await createApplication(
          newApplication,
          user.id
        );

      setApplications((currentApplications) => [
        createdApplication,
        ...currentApplications,
      ]);

      return createdApplication;
    } catch (error) {
      console.error(error);
      setError("Failed to create application.");
      throw error;
    }
  }

  async function updateApplication(application) {
    try {
      setError(null);

      const updatedApplication =
        await updateApplicationInDatabase(
          application
        );

      setApplications(
        (currentApplications) =>
          currentApplications.map(
            (currentApplication) =>
              currentApplication.id ===
              updatedApplication.id
                ? updatedApplication
                : currentApplication
          )
      );

      return updatedApplication;
    } catch (error) {
      console.error(error);
      setError("Failed to update application.");
      throw error;
    }
  }

  async function deleteApplication(applicationId) {
    try {
      setError(null);

      await deleteApplicationFromDatabase(applicationId);

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) =>
            application.id !== applicationId
        )
      );
    } catch (error) {
      console.error(error);
      setError("Failed to delete application.");
      throw error;
    }
  }

  async function deleteApplications(applicationIds) {
    try {
      setError(null);

      await deleteApplicationsFromDatabase(
        applicationIds
      );

      const idSet = new Set(applicationIds);

      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) =>
            !idSet.has(application.id)
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Failed to delete selected applications."
      );

      throw error;
    }
  }

  async function archiveApplication(
    applicationId
  ) {
    try {
      setError(null);

      const updated =
        await archiveApplicationInDatabase(
          applicationId
        );

      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id
            ? updated
            : application
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Failed to archive application."
      );
      throw error;
    }
  }

  async function restoreApplication(
    applicationId
  ) {
    try {
      setError(null);

      const updated =
        await restoreApplicationInDatabase(
          applicationId
        );

      setApplications((current) =>
        current.map((application) =>
          application.id === updated.id
            ? updated
            : application
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Failed to restore application."
      );
      throw error;
    }
  }

  async function archiveApplications(ids) {
    try {
      setError(null);

      const updated =
        await archiveApplicationsInDatabase(
          ids
        );

      setApplications((current) =>
        mergeUpdatedApplications(
          current,
          updated
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Failed to archive selected applications."
      );
      throw error;
    }
  }

  async function restoreApplications(ids) {
    try {
      setError(null);

      const updated =
        await restoreApplicationsInDatabase(
          ids
        );

      setApplications((current) =>
        mergeUpdatedApplications(
          current,
          updated
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "Failed to restore selected applications."
      );
      throw error;
    }
  }

  if (isAuthLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout profile={profile} user={user} />}>
          <Route
            path="/"
            element={
              <Dashboard
                applications={applications}
                onUpdateApplication={updateApplication}
                profile={profile}
                user={user}
              />
            }
          />

          <Route
            path="/applications"
            element={
              <Applications
                applications={applications}
                onAddApplication={addApplication}
                onDeleteApplications={deleteApplications}
                onArchiveApplication={archiveApplication}
                onRestoreApplication={restoreApplication}
                onArchiveApplications={archiveApplications}
                onRestoreApplications={restoreApplications}
                isLoading={isInitialLoading}
                isRefreshing={isRefreshing}
                error={error}
              />
            }
          />

          <Route
            path="/applications/:id"
            element={
              <ApplicationDetails
                applications={applications}
                user={user}
                onUpdateApplication={updateApplication}
                onDeleteApplication={deleteApplication}
              />
            }
          />

          <Route
            path="/pipeline"
            element={
              <Pipeline
                applications={applications}
                onUpdateApplication={updateApplication}
              />
            }
          />

          <Route
            path="/analytics"
            element={
              <Analytics
                applications={applications}
                user={user}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <Calendar
                applications={applications}
                user={user}
                onAddApplication={addApplication}
              />
            }
          />
          <Route
            path="/documents"
            element={
              <Documents
                user={user}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                onProfileUpdated={setProfile}
              />
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
