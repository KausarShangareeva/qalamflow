import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { AvatarProvider } from "./context/AvatarContext";
import "./index.css";
import "./i18n";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <AuthProvider>
        <AvatarProvider>
          <App />
        </AvatarProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
