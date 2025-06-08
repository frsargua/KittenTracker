import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const VITE_AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const VITE_AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
const VITE_AUTH0_AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUTH0_AUDIENCE;

const auth0Domain = VITE_AUTH0_DOMAIN;
const auth0Audience = VITE_AUTH0_AUTH0_AUDIENCE;
const auth0ClientId = VITE_AUTH0_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience, // Crucial for getting an Access Token for your API
        // scope: "openid profile email" // Add other scopes as needed
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
