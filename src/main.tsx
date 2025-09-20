import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
// Mark boot complete (used by index.html overlay)
if (typeof window !== 'undefined' && (window as any).__boot) {
	(window as any).__boot.mounted = true;
}
