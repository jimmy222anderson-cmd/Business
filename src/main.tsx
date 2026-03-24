import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { register as registerServiceWorker } from "./utils/serviceWorkerRegistration";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline support
registerServiceWorker();
