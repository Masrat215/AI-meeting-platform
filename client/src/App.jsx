import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { useTheme } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import { ProtectedRoute, PublicOnlyRoute } from "./components/RouteGuards";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MeetingDetail from "./pages/MeetingDetail";
import DesignPreview from "./pages/DesignPreview";
import NotFound from "./pages/NotFound";

function App() {
  const { theme } = useTheme();

  return (
    <>
      <Toaster position="top-right" richColors theme={theme} />
      <Routes>
        {/* Open to everyone */}
        <Route path="/" element={<Landing />} />

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
            <Route path="design" element={<DesignPreview />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;