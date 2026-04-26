import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/rajdhani/400.css";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
