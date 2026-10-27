import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* Respect the "reduce motion" setting of the user's device */}
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);