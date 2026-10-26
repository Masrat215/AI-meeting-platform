import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { useTheme } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MeetingDetail from "./pages/MeetingDetail";
import DesignPreview from "./pages/DesignPreview";

function App() {
  const { theme } = useTheme();

  return (
    <>
      <Toaster position="top-right" richColors theme={theme} />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/design" element={<DesignPreview />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;