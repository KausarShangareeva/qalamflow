import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import { ThemeProvider } from "./context/ThemeContext";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Workspace = lazy(() => import("./pages/Workspace"));
const SuggestProject = lazy(() => import("./pages/SuggestProject"));
const FeedbackPage = lazy(() => import("./pages/Feedback"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            {/* Auth routes - without layout */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Routes with layout */}
            <Route element={<RootLayout />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="suggest-project" element={<SuggestProject />} />
              <Route path="feedback" element={<FeedbackPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="dashboard"
                  element={<Navigate to="/workspace" replace />}
                />
                <Route path="workspace" element={<Workspace />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
