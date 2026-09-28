import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import QuoteDropPage from "./pages/_index";
import { ThemeModeProvider } from "./helpers/themeMode";
import "./base.css";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <QuoteDropPage />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeModeProvider>
  </React.StrictMode>,
);
