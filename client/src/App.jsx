import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation, useParams } from "react-router";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import "./a11y.css";
import { useTheme } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MeetingDetail from "./pages/MeetingDetail";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

// Old links such as /meetings/123 now live under /app
function OldMeetingRedirect() {
  const { id } = useParams();
  return <Navigate to={`/app/meetings/${id}`} replace />;
}

// The title shown on the browser tab, for each page
const TITLES = [
  [/^\/$/, "ScribWave · AI meeting notes"],
  [/^\/login\/?$/, "Log in"],
  [/^\/register\/?$/, "Create account"],
  [/^\/app\/?$/, "Dashboard"],
  [/^\/app\/meetings\/new\/?$/, "New meeting"],
  [/^\/app\/meetings\/[^/]+\/?$/, "Meeting"],
  [/^\/app\/tasks\/?$/, "Tasks"],
  [/^\/app\/analytics\/?$/, "Analytics"],
];

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = TITLES.find(([pattern]) => pattern.test(pathname));
    const title = match ? match[1] : "Page not found";
    document.title = title.startsWith("ScribWave") ? title : `${title} · ScribWave`;
  }, [pathname]);

  return null;
}

function App() {
  const { theme } = useTheme();
  const location = useLocation();

  return (
    // reducedMotion="user": people who ask their computer for less motion get no animation
    <MotionConfig reducedMotion="user">
      <PageTitle />
      <Toaster position="top-right" richColors theme={theme} />
      {/* A crash on any page shows a friendly screen, never a blank page */}
      <ErrorBoundary key={location.pathname}>
        <Routes>
          {/* Open to everyone */}
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Navigate to="/app/meetings/new" replace />} />
          <Route path="/meetings/:id" element={<OldMeetingRedirect />} />

          {/* Only for visitors who are not logged in */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Only for logged-in users */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="meetings/new" element={<Upload />} />
              <Route path="meetings/:id" element={<MeetingDetail />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </MotionConfig>
  );
}

export default App;
