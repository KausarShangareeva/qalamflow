import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
              <Route path="workspace" element={<Workspace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
