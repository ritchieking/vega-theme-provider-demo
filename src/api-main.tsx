import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApiPage } from "./api/ApiPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApiPage />
  </StrictMode>,
);
