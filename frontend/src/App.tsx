import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Schedule from "./pages/Schedule";
import Roadmap from "./pages/Roadmap";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <PWAInstallPrompt />
        <Routes>
          {/* Auth routes - without layout */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Routes with layout */}
          <Route element={<RootLayout />}>
            {/* Public routes */}
            <Route index element={<Home />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="roadmap" element={<Roadmap />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
